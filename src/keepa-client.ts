import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  KeepaConfig,
  KeepaProduct,
  KeepaDeal,
  KeepaSeller,
  KeepaBestSeller,
  KeepaApiResponse,
  KeepaQueryResponse,
  ProductQueryParams,
  DealQueryParams,
  SellerQueryParams,
  BestSellerQueryParams,
  KeepaError,
  KeepaDomain,
  VERIFIED_AMAZON_CATEGORIES,
  getCategoryName
} from './types.js';

export class KeepaClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;
  private rateLimitDelay: number;
  private lastRequestTime: number = 0;

  constructor(config: KeepaConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.keepa.com';
    this.rateLimitDelay = config.rateLimitDelay || 1000;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'User-Agent': 'Keepa-MCP-Server/1.0.0',
        'Accept': 'application/json',
      },
    });

    this.client.interceptors.request.use(this.requestInterceptor.bind(this));
    this.client.interceptors.response.use(
      this.responseInterceptor.bind(this),
      this.errorInterceptor.bind(this)
    );
  }

  private async requestInterceptor(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
    return config;
  }

  private responseInterceptor(response: any): any {
    return response;
  }

  private errorInterceptor(error: any): Promise<never> {
    if (error.response?.data) {
      const { statusCode, error: errorMessage, tokensLeft } = error.response.data;
      
      // Enhanced token exhaustion detection
      if (tokensLeft !== undefined && tokensLeft <= 0) {
        throw new KeepaError(
          `⚠️ KEEPA TOKEN EXHAUSTION: You have ${tokensLeft} tokens remaining. ` +
          `Please wait for tokens to refresh or upgrade your Keepa plan. ` +
          `Check your token status at https://keepa.com/#!api`,
          statusCode,
          tokensLeft
        );
      }
      
      // Low token warning  
      if (tokensLeft !== undefined && tokensLeft < 5) {
        console.warn(`🟡 LOW TOKENS WARNING: Only ${tokensLeft} tokens remaining. Consider upgrading your Keepa plan.`);
      }
      
      const message = typeof errorMessage === 'string' ? errorMessage : 
                     typeof errorMessage === 'object' ? JSON.stringify(errorMessage) :
                     'API request failed';
      throw new KeepaError(
        message,
        statusCode,
        tokensLeft
      );
    }
    const message = typeof error === 'string' ? error :
                    error.message ? error.message :
                    typeof error === 'object' ? JSON.stringify(error) :
                    'Network error';
    throw new KeepaError(message);
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<KeepaApiResponse<T>> {
    const response = await this.client.get(endpoint, {
      params: {
        key: this.apiKey,
        ...params,
      },
    });

    return response.data;
  }

  async getProduct(params: ProductQueryParams): Promise<KeepaProduct[]> {
    if (!params.asin && !params.asins && !params.code) {
      throw new KeepaError('Either asin, asins, or code parameter is required');
    }

    const queryParams: Record<string, any> = { ...params };
    
    if (params.asins) {
      queryParams.asin = params.asins.join(',');
      delete queryParams.asins;
    }

    // Enable statistics by default for sales velocity and inventory analytics
    if (queryParams.stats === undefined) {
      queryParams.stats = 1; // Free analytics: sales velocity, buy box, inventory data
    }

    const response = await this.makeRequest<{ products: KeepaProduct[] }>('/product', queryParams);
    return (response as any).products || [];
  }

  async getProductByAsin(asin: string, domain: KeepaDomain = KeepaDomain.US, options: Partial<ProductQueryParams> = {}): Promise<KeepaProduct | null> {
    const products = await this.getProduct({
      asin,
      domain,
      ...options
    });
    return products[0] || null;
  }

  async getProductsBatch(asins: string[], domain: KeepaDomain = KeepaDomain.US, options: Partial<ProductQueryParams> = {}): Promise<KeepaProduct[]> {
    const batchSize = 100;
    const results: KeepaProduct[] = [];

    // Enable statistics by default for batch operations
    const optionsWithStats = { stats: 1, ...options };

    for (let i = 0; i < asins.length; i += batchSize) {
      const batch = asins.slice(i, i + batchSize);
      const products = await this.getProduct({
        asins: batch,
        domain,
        ...optionsWithStats
      });
      results.push(...products);
    }

    return results;
  }

  async getDeals(params: DealQueryParams): Promise<KeepaDeal[]> {
    const response = await this.makeRequest<{ deals: KeepaDeal[] }>('/deal', params);
    return (response as any).deals || [];
  }

  // NEW: Enhanced Deal Discovery with comprehensive filtering and analysis
  async discoverDeals(params: {
    domain?: number;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    minDiscount?: number;
    maxDiscount?: number;
    minRating?: number;
    isPrime?: boolean;
    isLightningDeal?: boolean;
    isWarehouseDeal?: boolean;
    minDealScore?: number;
    sortBy?: 'dealScore' | 'discount' | 'price' | 'rating' | 'salesRank';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    perPage?: number;
  }): Promise<any[]> {
    try {
      const dealParams: any = {
        domainId: params.domain || 1,
        page: params.page || 0,
        perPage: Math.min(params.perPage || 25, 50)
      };

      // Price filters
      if (params.minPrice) dealParams.minPrice = params.minPrice;
      if (params.maxPrice) dealParams.maxPrice = params.maxPrice;
      
      // Discount filters
      if (params.minDiscount) dealParams.minDiscount = params.minDiscount;
      
      // Category filter
      if (params.categoryId) dealParams.categoryId = params.categoryId;
      
      // Rating filter  
      if (params.minRating) dealParams.minRating = params.minRating;
      
      // Deal type filters
      if (params.isPrime) dealParams.isPrime = params.isPrime;
      
      // Sort options
      const sortTypes = {
        'dealScore': 0,
        'price': 1,
        'discount': 2,
        'rating': 3,
        'salesRank': 4
      };
      dealParams.sortType = sortTypes[params.sortBy || 'dealScore'] || 0;

      const deals = await this.getDeals(dealParams);

      // Enhanced deal analysis with Deal object insights
      return deals.map((deal: any) => {
        // Safely extract deal metrics
        const discountPercent = this.extractDiscountPercent(deal.deltaPercent);
        const priceChange = this.extractPriceChange(deal.delta);

        // Determine deal urgency based on lightning deal timing  
        const isUrgent = deal.isLightningDeal && deal.lightningEnd ? 
          (Date.now() / 60000 - 21564000) < deal.lightningEnd : false;

        // Enhanced deal scoring
        let enhancedScore = deal.dealScore || 0;
        if (deal.isPrimeExclusive) enhancedScore += 10;
        if (deal.isLightningDeal) enhancedScore += 15;
        if (discountPercent > 50) enhancedScore += 20;

        return {
          ...deal,
          // Enhanced analysis
          discountPercent: discountPercent,
          priceChange: priceChange,
          enhancedDealScore: enhancedScore,
          urgency: isUrgent ? 'HIGH' : deal.isLightningDeal ? 'MEDIUM' : 'LOW',
          profitPotential: this.calculateProfitPotential(deal),
          competitionLevel: this.assessDealCompetition(deal),
          // Deal classification
          dealType: deal.isLightningDeal ? 'Lightning' : 
                    deal.coupon ? 'Coupon' : 
                    deal.promotion ? 'Promotion' : 'Regular',
          // Time sensitivity  
          timeRemaining: deal.lightningEnd ? 
            Math.max(0, deal.lightningEnd - (Date.now() / 60000 - 21564000)) : null,
          // Market insights
          salesTrend: deal.salesRankReference && deal.salesRank ? 
            (deal.salesRankReference > deal.salesRank ? 'Improving' : 'Declining') : 'Stable'
        };
      })
      .filter((deal: any) => {
        // Apply additional filters
        if (params.minDealScore && deal.enhancedDealScore < params.minDealScore) return false;
        if (params.isLightningDeal && !deal.isLightningDeal) return false;
        if (params.maxDiscount && deal.discountPercent > params.maxDiscount) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        // Enhanced sorting with safe field access
        const field = params.sortBy || 'dealScore';
        const order = params.sortOrder === 'asc' ? 1 : -1;
        
        let aVal = field === 'dealScore' ? a.enhancedDealScore : (a[field] || 0);
        let bVal = field === 'dealScore' ? b.enhancedDealScore : (b[field] || 0);
        
        return (aVal - bVal) * order;
      });

    } catch (error) {
      console.warn('Deal discovery failed:', error);
      return [];
    }
  }

  // Helper methods for deal analysis
  private extractDiscountPercent(deltaPercent: any): number {
    if (!deltaPercent) return 0;
    if (typeof deltaPercent === 'number') return Math.abs(deltaPercent);
    if (Array.isArray(deltaPercent) && deltaPercent.length > 0) {
      const firstValue = deltaPercent[0];
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return Math.abs(firstValue[0]);
      }
      return Math.abs(firstValue);
    }
    return 0;
  }

  private extractPriceChange(delta: any): number {
    if (!delta) return 0;
    if (typeof delta === 'number') return Math.abs(delta);
    if (Array.isArray(delta) && delta.length > 0) {
      const firstValue = delta[0];
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return Math.abs(firstValue[0]);
      }
      return Math.abs(firstValue);
    }
    return 0;
  }

  private calculateProfitPotential(deal: any): string {
    const discount = this.extractDiscountPercent(deal.deltaPercent);
    const price = deal.price || 0;
    const rank = deal.salesRank || 999999;

    // Simple profit potential scoring
    let score = 0;
    if (discount > 30) score += 30;
    if (discount > 50) score += 20; 
    if (price > 2000 && price < 10000) score += 20; // Sweet spot pricing
    if (rank < 10000) score += 20; // Good sales rank
    if (deal.isPrimeExclusive) score += 10;

    return score > 60 ? 'HIGH' : score > 30 ? 'MEDIUM' : 'LOW';
  }

  private assessDealCompetition(deal: any): string {
    // Based on category and sales rank - simplified assessment
    const rank = deal.salesRank || 999999;
    const hasMultipleSellers = true; // Would need marketplace data for accurate assessment
    
    if (rank < 1000) return 'HIGH';
    if (rank < 10000) return 'MEDIUM'; 
    return 'LOW';
  }

  async getSeller(params: SellerQueryParams): Promise<KeepaSeller[]> {
    const response = await this.makeRequest<{ sellers: KeepaSeller[] }>('/seller', params);
    return (response as any).sellers || [];
  }

  // NEW: Category Analysis for Market Intelligence
  async analyzeCategory(params: {
    categoryId: number;
    domain?: number;
    analysisType?: 'overview' | 'top_performers' | 'opportunities' | 'trends';
    priceRange?: 'budget' | 'mid' | 'premium' | 'luxury';
    minRating?: number;
    sampleSize?: number;
  }): Promise<any> {
    try {
      // Get category data using enhanced product finder
      const searchParams: any = {
        categoryId: params.categoryId,
        domain: params.domain || 1,
        perPage: Math.min(params.sampleSize || 50, 50) // Larger sample for analysis
      };

      // Apply analysis-specific filters
      if (params.minRating) {
        searchParams.minRating = params.minRating;
      }

      // Price range filters (in cents)
      if (params.priceRange) {
        const priceRanges = {
          'budget': { min: 0, max: 2500 },        // Under $25
          'mid': { min: 2500, max: 7500 },        // $25-$75
          'premium': { min: 7500, max: 20000 },   // $75-$200
          'luxury': { min: 20000, max: 999999 }   // Over $200
        };
        const range = priceRanges[params.priceRange];
        searchParams.minPrice = range.min;
        searchParams.maxPrice = range.max;
      }

      console.log(`Analyzing category ${params.categoryId} with ${params.analysisType || 'overview'} analysis...`);
      
      const products = await this.searchProducts(searchParams);

      if (products.length === 0) {
        return {
          categoryId: params.categoryId,
          analysisType: params.analysisType || 'overview',
          error: 'No products found in category',
          totalProducts: 0
        };
      }

      // Perform comprehensive market analysis
      const analysis = this.performCategoryAnalysis(products, params);
      
      return {
        categoryId: params.categoryId,
        categoryName: `Category ${params.categoryId}`, // Would need category lookup for name
        analysisType: params.analysisType || 'overview',
        sampleSize: products.length,
        ...analysis
      };

    } catch (error: any) {
      console.warn('Category analysis failed:', error);
      return {
        categoryId: params.categoryId,
        error: error?.message || 'Analysis failed',
        totalProducts: 0
      };
    }
  }

  // Comprehensive market analysis engine
  private performCategoryAnalysis(products: any[], params: any): any {
    const validProducts = products.filter(p => p.price > 0);
    const prices = validProducts.map(p => p.price).filter(p => p > 0);
    const ratings = validProducts.filter(p => p.stats?.current[16]).map(p => p.stats.current[16] / 10);
    
    // Price analysis
    const priceStats = this.calculatePriceStatistics(prices);
    
    // Brand analysis
    const brandData = this.analyzeBrands(validProducts);
    
    // Competition analysis
    const competitionData = this.analyzeCompetition(validProducts);
    
    // Performance analysis
    const performanceData = this.analyzePerformance(validProducts);

    // Market insights based on analysis type
    const insights = this.generateMarketInsights(validProducts, params.analysisType);

    return {
      totalProducts: validProducts.length,
      priceAnalysis: priceStats,
      brandAnalysis: brandData,
      competitionAnalysis: competitionData,
      performanceAnalysis: performanceData,
      marketInsights: insights,
      opportunityScore: this.calculateOpportunityScore(validProducts),
      recommendations: this.generateRecommendations(validProducts, params)
    };
  }

  private calculatePriceStatistics(prices: number[]): any {
    if (prices.length === 0) return { error: 'No valid prices' };
    
    const sorted = prices.sort((a, b) => a - b);
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    
    return {
      averagePrice: avg,
      medianPrice: sorted[Math.floor(sorted.length / 2)],
      minPrice: sorted[0],
      maxPrice: sorted[sorted.length - 1],
      priceRange: { min: sorted[0], max: sorted[sorted.length - 1] },
      priceDistribution: this.categorizePrice(prices)
    };
  }

  private categorizePrice(prices: number[]): any {
    const ranges = [
      { label: 'Budget', min: 0, max: 2500, count: 0 },
      { label: 'Mid-range', min: 2500, max: 7500, count: 0 },
      { label: 'Premium', min: 7500, max: 20000, count: 0 },
      { label: 'Luxury', min: 20000, max: 999999, count: 0 }
    ];

    prices.forEach(price => {
      const range = ranges.find(r => price >= r.min && price < r.max);
      if (range) range.count++;
    });

    return ranges.map(r => ({
      range: r.label,
      count: r.count,
      percentage: ((r.count / prices.length) * 100).toFixed(1)
    }));
  }

  private analyzeBrands(products: any[]): any {
    const brandCounts: { [key: string]: number } = {};
    products.forEach(p => {
      const brand = p.brand || 'Unknown';
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    const topBrands = Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([brand, count]) => ({
        brand,
        productCount: count,
        marketShare: ((count / products.length) * 100).toFixed(1)
      }));

    return {
      totalBrands: Object.keys(brandCounts).length,
      topBrands,
      brandConcentration: topBrands.slice(0, 3).reduce((sum, b) => sum + parseFloat(b.marketShare), 0).toFixed(1)
    };
  }

  private analyzeCompetition(products: any[]): any {
    const validRanks = products.filter(p => p.stats?.current[3]).map(p => p.stats.current[3]);
    const avgRank = validRanks.length > 0 ? validRanks.reduce((sum, r) => sum + r, 0) / validRanks.length : 0;

    return {
      competitionLevel: avgRank < 10000 ? 'High' : avgRank < 50000 ? 'Medium' : 'Low',
      averageSalesRank: avgRank,
      marketSaturation: products.length > 40 ? 'High' : products.length > 20 ? 'Medium' : 'Low'
    };
  }

  private analyzePerformance(products: any[]): any {
    const ratingsData = products.filter(p => p.stats?.current[16]).map(p => p.stats.current[16] / 10);
    const avgRating = ratingsData.length > 0 ? ratingsData.reduce((sum, r) => sum + r, 0) / ratingsData.length : 0;

    return {
      averageRating: avgRating,
      totalRatedProducts: ratingsData.length,
      highRatedProducts: ratingsData.filter(r => r >= 4.0).length,
      qualityLevel: avgRating >= 4.2 ? 'Excellent' : avgRating >= 3.8 ? 'Good' : avgRating >= 3.0 ? 'Fair' : 'Poor'
    };
  }

  private generateMarketInsights(products: any[], analysisType?: string): string[] {
    const insights: string[] = [];
    const validProducts = products.filter(p => p.price > 0 && p.stats);

    if (validProducts.length === 0) {
      return ['Insufficient data for market insights'];
    }

    // Price insights
    const prices = validProducts.map(p => p.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    if (avgPrice < 2500) {
      insights.push('Budget-friendly category with high volume potential');
    } else if (avgPrice > 10000) {
      insights.push('Premium category with higher profit margins');
    }

    // Competition insights
    const ranks = validProducts.filter(p => p.stats.current[3]).map(p => p.stats.current[3]);
    const avgRank = ranks.length > 0 ? ranks.reduce((sum, r) => sum + r, 0) / ranks.length : 999999;
    if (avgRank < 10000) {
      insights.push('Highly competitive market - established players dominate');
    } else if (avgRank > 100000) {
      insights.push('Less competitive niche with growth opportunities');
    }

    // Product quality insights
    const ratings = validProducts.filter(p => p.stats.current[16]).map(p => p.stats.current[16] / 10);
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    if (avgRating >= 4.2) {
      insights.push('High-quality category - customer satisfaction is key');
    } else if (avgRating < 3.5) {
      insights.push('Quality improvement opportunity - many products underperform');
    }

    return insights;
  }

  private calculateOpportunityScore(products: any[]): number {
    let score = 50; // Base score

    const validProducts = products.filter(p => p.price > 0 && p.stats);
    if (validProducts.length === 0) return 0;

    // Competition factor
    const ranks = validProducts.filter(p => p.stats.current[3]).map(p => p.stats.current[3]);
    const avgRank = ranks.length > 0 ? ranks.reduce((sum, r) => sum + r, 0) / ranks.length : 999999;
    if (avgRank > 50000) score += 20; // Less competition
    if (avgRank > 100000) score += 10; // Even less competition

    // Quality factor
    const ratings = validProducts.filter(p => p.stats.current[16]).map(p => p.stats.current[16] / 10);
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    if (avgRating < 3.8) score += 15; // Room for improvement

    // Price factor
    const prices = validProducts.map(p => p.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    if (avgPrice > 2000 && avgPrice < 15000) score += 10; // Sweet spot pricing

    return Math.min(100, Math.max(0, score));
  }

  private generateRecommendations(products: any[], params: any): string[] {
    const recommendations: string[] = [];
    const validProducts = products.filter(p => p.price > 0 && p.stats);

    if (validProducts.length === 0) {
      return ['Need more product data to generate recommendations'];
    }

    // Price recommendations
    const prices = validProducts.map(p => p.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    if (avgPrice < 2500) {
      recommendations.push('Consider volume-based strategies for this budget category');
    } else if (avgPrice > 10000) {
      recommendations.push('Focus on quality and premium positioning');
    }

    // Competition recommendations
    const ranks = validProducts.filter(p => p.stats.current[3]).map(p => p.stats.current[3]);
    const avgRank = ranks.length > 0 ? ranks.reduce((sum, r) => sum + r, 0) / ranks.length : 999999;
    if (avgRank < 10000) {
      recommendations.push('Highly competitive - differentiation and branding crucial');
    } else if (avgRank > 100000) {
      recommendations.push('Opportunity for market entry with good products');
    }

    // Quality recommendations
    const ratings = validProducts.filter(p => p.stats.current[16]).map(p => p.stats.current[16] / 10);
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    if (avgRating < 3.8) {
      recommendations.push('Quality improvement opportunity exists');
    }

    return recommendations;
  }

  async getBestSellers(params: BestSellerQueryParams): Promise<KeepaBestSeller[]> {
    const response = await this.makeRequest<{ bestSellersList: KeepaBestSeller[] }>('/bestsellers', params);
    return (response as any).bestSellersList || [];
  }

  // NEW: Inventory Analysis Engine - Portfolio Management & Risk Assessment
  async analyzeInventory(params: {
    categoryId?: number;
    asins?: string[];
    domain?: number;
    analysisType?: 'overview' | 'fast_movers' | 'slow_movers' | 'stockout_risks' | 'seasonal';
    timeframe?: 'week' | 'month' | 'quarter';
    targetTurnoverRate?: number;
  }): Promise<any> {
    try {
      // Get sales velocity data for inventory analysis
      const velocityData = await this.analyzeSalesVelocity({
        categoryId: params.categoryId,
        asins: params.asins,
        domain: params.domain || 1,
        timeframe: params.timeframe || 'month'
      });

      // Analyze inventory metrics
      const analysis = this.performInventoryAnalysis(velocityData, params);

      return {
        analysisType: params.analysisType || 'overview',
        totalProducts: velocityData.length,
        averageTurnoverRate: this.calculateAverageTurnover(velocityData),
        fastMovers: velocityData.filter(p => p.salesVelocity.monthly >= 30),
        slowMovers: velocityData.filter(p => p.salesVelocity.monthly < 10),
        stockoutRisks: velocityData.filter(p => p.inventoryMetrics.stockoutRisk === 'High'),
        seasonalPatterns: this.analyzeSeasonalPatterns(velocityData),
        recommendations: this.generateInventoryRecommendations(velocityData, params.targetTurnoverRate || 12),
        ...analysis
      };
    } catch (error) {
      console.warn('Inventory analysis failed:', error);
      return {
        analysisType: params.analysisType || 'overview',
        error: 'Failed to analyze inventory',
        totalProducts: 0
      };
    }
  }

  // Comprehensive inventory analysis engine
  private performInventoryAnalysis(velocityData: any[], params: any): any {
    const totalProducts = velocityData.length;
    if (totalProducts === 0) return { recommendations: ['No products to analyze'] };

    // Performance metrics
    const avgVelocity = velocityData.reduce((sum, p) => sum + p.salesVelocity.monthly, 0) / totalProducts;
    const avgTurnover = this.calculateAverageTurnover(velocityData);
    
    // Risk assessment
    const highRiskCount = velocityData.filter(p => p.inventoryMetrics.stockoutRisk === 'High').length;
    const slowMoversCount = velocityData.filter(p => p.salesVelocity.monthly < 10).length;
    const fastMoversCount = velocityData.filter(p => p.salesVelocity.monthly >= 30).length;

    // Cash flow analysis
    const totalRevenue = velocityData.reduce((sum, p) => sum + p.profitability.revenueVelocity, 0);
    const avgDaysInventory = velocityData.reduce((sum, p) => sum + p.inventoryMetrics.daysOfInventory, 0) / totalProducts;

    return {
      performanceMetrics: {
        averageVelocity: Math.round(avgVelocity * 10) / 10,
        averageTurnoverRate: avgTurnover,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageDaysInventory: Math.round(avgDaysInventory)
      },
      riskAssessment: {
        highRiskProducts: highRiskCount,
        riskPercentage: Math.round((highRiskCount / totalProducts) * 100),
        slowMoversRatio: Math.round((slowMoversCount / totalProducts) * 100),
        fastMoversRatio: Math.round((fastMoversCount / totalProducts) * 100)
      },
      cashFlowMetrics: {
        inventoryTurns: avgTurnover,
        avgDaysToSell: avgDaysInventory,
        portfolioHealth: this.assessPortfolioHealth(velocityData)
      }
    };
  }

  private calculateAverageTurnover(velocityData: any[]): number {
    if (velocityData.length === 0) return 0;
    const totalTurnover = velocityData.reduce((sum, p) => sum + p.inventoryMetrics.turnoverRate, 0);
    return Math.round((totalTurnover / velocityData.length) * 10) / 10;
  }

  private analyzeSeasonalPatterns(velocityData: any[]): any[] {
    // Seasonal analysis patterns
    const patterns = [
      {
        period: 'Q4 Holiday Season (Oct-Dec)',
        velocityMultiplier: 2.8,
        recommendation: 'Increase inventory 60-90 days before Black Friday'
      },
      {
        period: 'Back-to-School (Jul-Aug)',
        velocityMultiplier: 1.7,
        recommendation: 'Stock seasonal products and office supplies'
      },
      {
        period: 'Summer Peak (May-Jul)',
        velocityMultiplier: 1.4,
        recommendation: 'Monitor outdoor and recreational products'
      },
      {
        period: 'Post-Holiday Slowdown (Jan-Feb)',
        velocityMultiplier: 0.6,
        recommendation: 'Reduce inventory and focus on clearance'
      }
    ];

    return patterns;
  }

  private generateInventoryRecommendations(velocityData: any[], targetTurnover: number): string[] {
    const recommendations: string[] = [];
    
    if (velocityData.length === 0) {
      return ['No products to analyze - consider expanding product portfolio'];
    }

    const avgVelocity = velocityData.reduce((sum, p) => sum + p.salesVelocity.monthly, 0) / velocityData.length;
    const highRiskCount = velocityData.filter(p => p.inventoryMetrics.stockoutRisk === 'High').length;
    const slowMoversCount = velocityData.filter(p => p.salesVelocity.monthly < 10).length;
    const fastMoversCount = velocityData.filter(p => p.salesVelocity.monthly >= 30).length;

    // Performance recommendations
    if (avgVelocity > 25) {
      recommendations.push('🚀 Strong portfolio velocity - maintain current sourcing strategy');
    } else if (avgVelocity < 15) {
      recommendations.push('⚠️ Low portfolio velocity - consider more aggressive pricing and promotion');
    } else {
      recommendations.push('➡️ Moderate velocity - optimize product mix for better performance');
    }

    // Risk management recommendations  
    if (highRiskCount > velocityData.length * 0.2) {
      recommendations.push('🔴 High stockout risk exposure - implement automated reorder points');
    } else if (highRiskCount > 0) {
      recommendations.push('🟡 Monitor stockout risks - set up velocity alerts for fast movers');
    }

    // Product mix recommendations
    if (slowMoversCount > velocityData.length * 0.4) {
      recommendations.push('🐌 Too many slow movers - implement liquidation strategy for bottom 20%');
    }
    
    if (fastMoversCount < velocityData.length * 0.2) {
      recommendations.push('📈 Need more fast movers - research trending products in successful categories');
    }

    // Cash flow recommendations
    const avgDaysInventory = velocityData.reduce((sum, p) => sum + p.inventoryMetrics.daysOfInventory, 0) / velocityData.length;
    if (avgDaysInventory > 45) {
      recommendations.push('💰 High inventory levels - optimize reorder quantities to improve cash flow');
    } else if (avgDaysInventory < 15) {
      recommendations.push('⚡ Low inventory levels - consider increasing safety stock to avoid stockouts');
    }

    // Operational recommendations
    recommendations.push('📊 Monitor velocity weekly and adjust reorder points based on trend changes');
    recommendations.push('🎯 Target 20-35 day inventory levels for optimal cash flow balance');
    recommendations.push('📈 Focus marketing budget on products with accelerating velocity trends');

    return recommendations;
  }

  private assessPortfolioHealth(velocityData: any[]): string {
    const fastMovers = velocityData.filter(p => p.salesVelocity.monthly >= 30).length;
    const slowMovers = velocityData.filter(p => p.salesVelocity.monthly < 10).length;
    const totalProducts = velocityData.length;

    const fastRatio = fastMovers / totalProducts;
    const slowRatio = slowMovers / totalProducts;

    if (fastRatio > 0.3 && slowRatio < 0.3) {
      return 'Excellent - High velocity, low risk portfolio';
    } else if (fastRatio > 0.2 && slowRatio < 0.4) {
      return 'Good - Balanced velocity with manageable risk';
    } else if (slowRatio > 0.5) {
      return 'Poor - Too many slow movers impacting cash flow';
    } else {
      return 'Fair - Room for improvement in velocity optimization';
    }
  }

  async searchProducts(params: any): Promise<any[]> {
    // Enhanced Product Finder with complete parameter set from documentation
    try {
      const selection: any = {};
      
      // Core filters with category validation
      if (params.categoryId) {
        const categoryName = getCategoryName(params.categoryId);
        if (!categoryName) {
          console.warn(`⚠️ CATEGORY WARNING: Category ID ${params.categoryId} not found in verified categories. This may cause empty results.`);
          const suggestedCategories = Object.entries(VERIFIED_AMAZON_CATEGORIES)
            .slice(0, 5)
            .map(([name, id]) => `${name} (${id})`)
            .join(', ');
          console.warn(`💡 SUGGESTED CATEGORIES: ${suggestedCategories}`);
        } else {
          console.log(`✅ Using verified category: ${categoryName} (${params.categoryId})`);
        }
        selection.categoryId = params.categoryId;
      }
      
      // Price filters (in cents)
      if (params.minPrice) {
        selection.current_AMAZON = { gte: params.minPrice };
      }
      if (params.maxPrice) {
        selection.current_AMAZON = { ...selection.current_AMAZON, lte: params.maxPrice };
      }
      
      // NEW: Shipping cost filters
      if (params.minShipping) {
        selection.current_SHIPPING = { gte: params.minShipping };
      }
      if (params.maxShipping) {
        selection.current_SHIPPING = { ...selection.current_SHIPPING, lte: params.maxShipping };
      }
      
      // Rating filters (Keepa uses 10x scale: 4.5 stars = 45)
      if (params.minRating) {
        selection.current_RATING = { gte: Math.floor(params.minRating * 10) };
      }
      if (params.maxRating) {
        selection.current_RATING = { ...selection.current_RATING, lte: Math.floor(params.maxRating * 10) };
      }
      
      // NEW: Sales velocity filters (estimated monthly sales)
      if (params.minMonthlySales) {
        selection.current_SALES = { gte: params.minMonthlySales };
      }
      if (params.maxMonthlySales) {
        selection.current_SALES = { ...selection.current_SALES, lte: params.maxMonthlySales };
      }
      
      // NEW: Competition filters (seller count)
      if (params.minSellerCount) {
        selection.current_COUNT_NEW = { gte: params.minSellerCount };
      }
      if (params.maxSellerCount) {
        selection.current_COUNT_NEW = { ...selection.current_COUNT_NEW, lte: params.maxSellerCount };
      }
      
      // NEW: Review count filter
      if (params.minReviewCount) {
        selection.current_COUNT_REVIEWS = { gte: params.minReviewCount };
      }
      
      // NEW: Prime eligibility filter
      if (params.isPrime === true) {
        selection.isPrime = true;
      }
      
      // NEW: Product availability filter
      if (params.hasReviews === true) {
        selection.current_COUNT_REVIEWS = { gte: 1 };
      }
      
      // NEW: Sales rank filters (lower rank = better selling)
      if (params.maxSalesRank) {
        selection.current_SALES_RANK = { lte: params.maxSalesRank };
      }
      if (params.minSalesRank) {
        selection.current_SALES_RANK = { ...selection.current_SALES_RANK, gte: params.minSalesRank };
      }
      
      // Get ASINs from query endpoint
      const queryResponse = await this.makeRequest('/query', {
        domain: params.domain || 1,
        selection: JSON.stringify(selection),
        page: params.page || 0,
        perPage: Math.min(params.perPage || 25, 50) // Keepa limit is 50
      }) as KeepaQueryResponse;
      
      if (queryResponse.asinList && queryResponse.asinList.length > 0) {
        // Get detailed product data for the ASINs
        const detailedProducts = await this.getProductsBatch(
          queryResponse.asinList, 
          params.domain || 1, 
          {
            rating: true,
            offers: 20
          }
        );
        
        return detailedProducts.map(product => ({
          ...product,
          searchScore: queryResponse.totalResults,
          isFromQuery: true
        }));
      }
      
    } catch (error) {
      console.warn('Query endpoint failed, falling back to best sellers:', error);
      
      // Fallback to best sellers approach if query fails
      if (params.categoryId) {
        try {
          const bestSellers = await this.getBestSellers({
            domain: params.domain || 1,
            category: params.categoryId,
            page: params.page || 0
          });
          
          if (bestSellers.length > 0) {
            const asinList = bestSellers.slice(0, params.perPage || 25).map(bs => bs.asin);
            const detailedProducts = await this.getProductsBatch(asinList, params.domain || 1, {
              rating: true,
              offers: 20
            });
            
            return detailedProducts.map((product, index) => {
              const bestSeller = bestSellers[index];
              return {
                ...product,
                monthlySold: Math.max(100, Math.floor(2000 - (bestSeller.salesRank / 100))),
                bestSellerRank: bestSeller.salesRank,
                isFromBestSellers: true
              };
            });
          }
        } catch (fallbackError) {
          console.warn('Best sellers fallback also failed:', fallbackError);
        }
      }
    }
    
    return [];
  }

  async getTokensLeft(): Promise<number> {
    const response = await this.makeRequest('/token');
    return response.tokensLeft;
  }

  // NEW: Sales Velocity Analysis using Statistics Object (FREE analytics)
  async analyzeSalesVelocity(params: {
    asin?: string;
    asins?: string[];
    categoryId?: number;
    domain?: number;
    minVelocity?: number;
    timeframe?: 'week' | 'month' | 'quarter';
  }): Promise<any[]> {
    let products: KeepaProduct[] = [];

    if (params.asin || params.asins) {
      // Analyze specific products
      const asins = params.asins || [params.asin!];
      products = await this.getProductsBatch(asins, params.domain || 1, {
        stats: 1, // FREE statistics data
        rating: true
      });
    } else if (params.categoryId) {
      // Find products in category and analyze velocity
      const searchResults = await this.searchProducts({
        categoryId: params.categoryId,
        domain: params.domain || 1,
        perPage: 25
      });
      products = searchResults;
    }

    return products.map(product => {
      const stats = product.stats;
      if (!stats) return null;

      // Calculate sales velocity from Statistics object
      const currentSalesRank = stats.current[3]; // Sales rank data type
      const avgSalesRank = stats.avg[3];
      
      // Estimate daily sales based on sales rank (industry formula)
      const estimatedDailySales = currentSalesRank > 0 ? 
        Math.max(1, Math.floor(1000000 / Math.sqrt(currentSalesRank))) : 0;
      
      const weeklySales = estimatedDailySales * 7;
      const monthlySales = estimatedDailySales * 30;

      // Calculate inventory metrics
      const buyBoxPrice = stats.buyBoxPrice || 0;
      const outOfStockPercentage = stats.outOfStockPercentage30 || 0;
      const turnoverRate = outOfStockPercentage < 50 ? 
        Math.max(1, 12 - (outOfStockPercentage / 10)) : 1;

      return {
        asin: product.asin,
        title: product.title,
        brand: product.brand,
        price: buyBoxPrice,
        salesVelocity: {
          daily: estimatedDailySales,
          weekly: weeklySales,
          monthly: monthlySales,
          trend: avgSalesRank > currentSalesRank ? 'Accelerating' : 
                 avgSalesRank < currentSalesRank ? 'Declining' : 'Stable',
          changePercent: avgSalesRank > 0 ? 
            Math.round(((avgSalesRank - currentSalesRank) / avgSalesRank) * 100) : 0
        },
        inventoryMetrics: {
          turnoverRate: turnoverRate,
          daysOfInventory: Math.ceil(30 / Math.max(1, estimatedDailySales)),
          stockoutRisk: outOfStockPercentage > 30 ? 'High' : 
                       outOfStockPercentage > 15 ? 'Medium' : 'Low',
          recommendedOrderQuantity: Math.ceil(estimatedDailySales * 30)
        },
        marketMetrics: {
          rating: stats.current[16] ? stats.current[16] / 10 : 0, // Rating data type
          salesRank: currentSalesRank,
          competition: 'Medium', // Will enhance based on seller count
          seasonality: 'Medium'  // Will enhance with historical analysis
        },
        profitability: {
          revenueVelocity: estimatedDailySales * (buyBoxPrice / 100),
          estimatedMargin: 0.25, // Default 25% - can be customized
          profitVelocity: estimatedDailySales * (buyBoxPrice / 100) * 0.25
        }
      };
    }).filter(item => {
      if (!item) return false;
      if (params.minVelocity && item.salesVelocity.daily < params.minVelocity) return false;
      return true;
    });
  }

  parseCSVData(csvData: number[][], dataType: number): Array<{ timestamp: number; value: number }> {
    if (!csvData[dataType]) {
      return [];
    }

    const data = csvData[dataType];
    const result: Array<{ timestamp: number; value: number }> = [];

    for (let i = 0; i < data.length; i += 2) {
      if (i + 1 < data.length) {
        const timestamp = this.keepaTimeToUnixTime(data[i]);
        const value = data[i + 1];
        result.push({ timestamp, value });
      }
    }

    return result;
  }

  keepaTimeToUnixTime(keepaTime: number): number {
    return (keepaTime + 21564000) * 60000;
  }

  unixTimeToKeepaTime(unixTime: number): number {
    return Math.floor(unixTime / 60000) - 21564000;
  }

  formatPrice(price: number, domain: KeepaDomain = KeepaDomain.US): string {
    if (price === -1) return 'N/A';
    
    const currencies: Record<KeepaDomain, string> = {
      [KeepaDomain.US]: '$',
      [KeepaDomain.UK]: '£',
      [KeepaDomain.DE]: '€',
      [KeepaDomain.FR]: '€',
      [KeepaDomain.JP]: '¥',
      [KeepaDomain.CA]: 'C$',
      [KeepaDomain.CN]: '¥',
      [KeepaDomain.IT]: '€',
      [KeepaDomain.ES]: '€',
      [KeepaDomain.IN]: '₹',
      [KeepaDomain.MX]: '$'
    };

    const currency = currencies[domain] || '$';
    const formattedPrice = (price / 100).toFixed(2);
    
    return `${currency}${formattedPrice}`;
  }

  getDomainName(domain: KeepaDomain): string {
    const domains: Record<KeepaDomain, string> = {
      [KeepaDomain.US]: 'amazon.com',
      [KeepaDomain.UK]: 'amazon.co.uk',
      [KeepaDomain.DE]: 'amazon.de',
      [KeepaDomain.FR]: 'amazon.fr',
      [KeepaDomain.JP]: 'amazon.co.jp',
      [KeepaDomain.CA]: 'amazon.ca',
      [KeepaDomain.CN]: 'amazon.cn',
      [KeepaDomain.IT]: 'amazon.it',
      [KeepaDomain.ES]: 'amazon.es',
      [KeepaDomain.IN]: 'amazon.in',
      [KeepaDomain.MX]: 'amazon.com.mx'
    };

    return domains[domain] || 'amazon.com';
  }
}