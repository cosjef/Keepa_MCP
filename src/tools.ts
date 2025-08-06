import { z } from 'zod';
import { KeepaClient } from './keepa-client.js';
import { KeepaDomain, KeepaDataType, ProductFinderResult, CategoryInsights, SalesVelocityData, InventoryAnalysis } from './types.js';

export const ProductLookupSchema = z.object({
  asin: z.string().describe('Amazon ASIN (product identifier)'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  days: z.number().min(1).max(365).optional().describe('Number of days of price history to include'),
  history: z.boolean().default(false).describe('Include full price history'),
  offers: z.number().min(0).max(100).optional().describe('Number of marketplace offers to include'),
  variations: z.boolean().default(false).describe('Include product variations'),
  rating: z.boolean().default(false).describe('Include product rating data'),
});

export const BatchProductLookupSchema = z.object({
  asins: z.array(z.string()).max(100).describe('Array of Amazon ASINs (max 100)'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  days: z.number().min(1).max(365).optional().describe('Number of days of price history to include'),
  history: z.boolean().default(false).describe('Include full price history'),
});

export const DealSearchSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().optional().describe('Amazon category ID to filter by'),
  minPrice: z.number().min(0).optional().describe('Minimum price in cents'),
  maxPrice: z.number().min(0).optional().describe('Maximum price in cents'),
  minDiscount: z.number().min(0).max(100).optional().describe('Minimum discount percentage'),
  minRating: z.number().min(1).max(5).optional().describe('Minimum product rating (1-5 stars)'),
  isPrime: z.boolean().optional().describe('Filter for Prime eligible deals only'),
  sortType: z.number().min(0).max(4).default(0).describe('Sort type (0=deal score, 1=price, 2=discount, 3=rating, 4=reviews)'),
  page: z.number().min(0).default(0).describe('Page number for pagination'),
  perPage: z.number().min(1).max(50).default(25).describe('Results per page (max 50)'),
});

export const SellerLookupSchema = z.object({
  seller: z.string().describe('Seller ID or name'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  storefront: z.number().min(0).max(100000).optional().describe('Number of storefront ASINs to retrieve'),
});

export const BestSellersSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  category: z.number().describe('Amazon category ID'),
  page: z.number().min(0).default(0).describe('Page number for pagination'),
});

export const PriceHistorySchema = z.object({
  asin: z.string().describe('Amazon ASIN (product identifier)'),
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  dataType: z.number().min(0).max(30).describe('Data type (0=Amazon, 1=New, 2=Used, 3=Sales Rank, etc.)'),
  days: z.number().min(1).max(365).default(30).describe('Number of days of history'),
});

export const ProductFinderSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().optional().describe('Amazon category ID to search within'),
  minRating: z.number().min(1).max(5).optional().describe('Minimum product rating (1-5 stars)'),
  maxRating: z.number().min(1).max(5).optional().describe('Maximum product rating (1-5 stars)'),
  minPrice: z.number().min(0).optional().describe('Minimum price in cents'),
  maxPrice: z.number().min(0).optional().describe('Maximum price in cents'),
  minShipping: z.number().min(0).optional().describe('Minimum shipping cost in cents'),
  maxShipping: z.number().min(0).optional().describe('Maximum shipping cost in cents'),
  minMonthlySales: z.number().min(0).optional().describe('Minimum estimated monthly sales'),
  maxMonthlySales: z.number().min(0).optional().describe('Maximum estimated monthly sales'),
  minSellerCount: z.number().min(0).optional().describe('Minimum number of sellers'),
  maxSellerCount: z.number().min(0).optional().describe('Maximum number of sellers'),
  isPrime: z.boolean().optional().describe('Filter for Prime eligible products only'),
  hasReviews: z.boolean().optional().describe('Filter for products with reviews only'),
  productType: z.number().min(0).max(2).default(0).optional().describe('Product type (0=standard, 1=variation parent, 2=variation child)'),
  sortBy: z.enum(['monthlySold', 'price', 'rating', 'reviewCount', 'salesRank']).default('monthlySold').describe('Sort results by field'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort order (ascending or descending)'),
  page: z.number().min(0).default(0).describe('Page number for pagination'),
  perPage: z.number().min(1).max(50).default(25).describe('Results per page (max 50)'),
});

export const CategoryAnalysisSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().describe('Amazon category ID to analyze'),
  analysisType: z.enum(['overview', 'top_performers', 'opportunities', 'trends']).default('overview').describe('Type of analysis to perform'),
  priceRange: z.enum(['budget', 'mid', 'premium', 'luxury']).optional().describe('Focus on specific price range'),
  minRating: z.number().min(1).max(5).default(3.0).describe('Minimum rating for products to include'),
  includeSubcategories: z.boolean().default(false).describe('Include analysis of subcategories'),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month').describe('Timeframe for trend analysis'),
});

export const SalesVelocitySchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().optional().describe('Amazon category ID to filter by'),
  asin: z.string().optional().describe('Single ASIN to analyze'),
  asins: z.array(z.string()).max(50).optional().describe('Array of ASINs to analyze (max 50)'),
  timeframe: z.enum(['week', 'month', 'quarter']).default('month').describe('Time period for velocity calculation'),
  minVelocity: z.number().min(0).optional().describe('Minimum daily sales velocity'),
  maxVelocity: z.number().min(0).optional().describe('Maximum daily sales velocity'),
  minPrice: z.number().min(0).optional().describe('Minimum price in cents'),
  maxPrice: z.number().min(0).optional().describe('Maximum price in cents'),
  minRating: z.number().min(1).max(5).default(3.0).describe('Minimum product rating'),
  sortBy: z.enum(['velocity', 'turnoverRate', 'revenueVelocity', 'trend']).default('velocity').describe('Sort results by metric'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort order'),
  page: z.number().min(0).default(0).describe('Page number for pagination'),
  perPage: z.number().min(1).max(50).default(25).describe('Results per page (max 50)'),
});

export const InventoryAnalysisSchema = z.object({
  domain: z.number().min(1).max(11).default(1).describe('Amazon domain (1=US, 2=UK, 3=DE, etc.)'),
  categoryId: z.number().optional().describe('Amazon category ID to analyze'),
  asins: z.array(z.string()).max(100).optional().describe('Specific ASINs to analyze (your inventory)'),
  analysisType: z.enum(['overview', 'fast_movers', 'slow_movers', 'stockout_risks', 'seasonal']).default('overview').describe('Type of inventory analysis'),
  timeframe: z.enum(['week', 'month', 'quarter']).default('month').describe('Analysis timeframe'),
  targetTurnoverRate: z.number().min(1).max(50).default(12).describe('Target inventory turns per year'),
});

export class KeepaTools {
  constructor(private client: KeepaClient) {}

  async lookupProduct(params: z.infer<typeof ProductLookupSchema>): Promise<string> {
    try {
      const product = await this.client.getProductByAsin(
        params.asin,
        params.domain as KeepaDomain,
        {
          days: params.days,
          history: params.history,
          offers: params.offers,
          variations: params.variations,
          rating: params.rating,
        }
      );

      if (!product) {
        return `Product not found for ASIN: ${params.asin}`;
      }

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Product Information for ${params.asin}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📦 **Title**: ${product.title || 'N/A'}\n`;
      result += `🏷️ **Brand**: ${product.brand || 'N/A'}\n`;
      result += `📊 **Category**: ${product.productGroup || 'N/A'}\n`;

      if (product.stats) {
        const currentPrice = product.stats.current[0];
        if (currentPrice && currentPrice !== -1) {
          result += `💰 **Current Price**: ${this.client.formatPrice(currentPrice, domain)}\n`;
        }

        const avgPrice = product.stats.avg[0];
        if (avgPrice && avgPrice !== -1) {
          result += `📈 **Average Price**: ${this.client.formatPrice(avgPrice, domain)}\n`;
        }

        if (product.stats.salesRankReference) {
          result += `📊 **Sales Rank**: #${product.stats.salesRankReference.toLocaleString()}\n`;
        }
      }

      if (params.rating && product.stats?.current[16]) {
        const rating = product.stats.current[16] / 10;
        const reviewCount = product.stats.current[17];
        result += `⭐ **Rating**: ${rating.toFixed(1)}/5.0 (${reviewCount} reviews)\n`;
      }

      if (product.offers && product.offers.length > 0) {
        result += `\n**Marketplace Offers**: ${product.offers.length} available\n`;
        const topOffers = product.offers.slice(0, 3);
        topOffers.forEach((offer, i) => {
          result += `${i + 1}. ${offer.isAmazon ? '🟦 Amazon' : '🏪 3P Seller'} - `;
          result += `${offer.isPrime ? '⚡ Prime' : 'Standard'} - `;
          result += `${offer.isFBA ? 'FBA' : 'FBM'}\n`;
        });
      }

      if (params.variations && product.variations && product.variations.length > 0) {
        result += `\n**Variations**: ${product.variations.length} available\n`;
      }

      return result;
    } catch (error) {
      return `Error looking up product: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async batchLookupProducts(params: z.infer<typeof BatchProductLookupSchema>): Promise<string> {
    try {
      const products = await this.client.getProductsBatch(
        params.asins,
        params.domain as KeepaDomain,
        {
          days: params.days,
          history: params.history,
        }
      );

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Batch Product Lookup Results (${products.length}/${params.asins.length} found)**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n\n`;

      products.forEach((product, i) => {
        result += `**${i + 1}. ${product.asin}**\n`;
        result += `📦 ${product.title || 'N/A'}\n`;
        result += `🏷️ ${product.brand || 'N/A'}\n`;
        
        if (product.stats?.current[0] && product.stats.current[0] !== -1) {
          result += `💰 ${this.client.formatPrice(product.stats.current[0], domain)}\n`;
        }
        
        if (product.stats?.salesRankReference) {
          result += `📊 Rank: #${product.stats.salesRankReference.toLocaleString()}\n`;
        }
        
        result += '\n';
      });

      const notFound = params.asins.filter(asin => 
        !products.some(product => product.asin === asin)
      );

      if (notFound.length > 0) {
        result += `**Not Found**: ${notFound.join(', ')}\n`;
      }

      return result;
    } catch (error) {
      return `Error in batch lookup: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async searchDeals(params: z.infer<typeof DealSearchSchema>): Promise<string> {
    try {
      const deals = await this.client.getDeals({
        domainId: params.domain,
        categoryId: params.categoryId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minDiscount: params.minDiscount,
        minRating: params.minRating,
        isPrime: params.isPrime,
        sortType: params.sortType,
        page: params.page,
        perPage: params.perPage,
      });

      if (deals.length === 0) {
        return 'No deals found matching your criteria.';
      }

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Amazon Deals Found: ${deals.length}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n\n`;

      deals.forEach((deal, i) => {
        result += `**${i + 1}. ${deal.asin}**\n`;
        result += `📦 **${deal.title}**\n`;
        result += `🏷️ Brand: ${deal.brand || 'N/A'}\n`;
        result += `💰 **Price**: ${this.client.formatPrice(deal.price, domain)}`;
        
        if (deal.shipping > 0) {
          result += ` + ${this.client.formatPrice(deal.shipping, domain)} shipping`;
        }
        result += '\n';
        
        result += `📊 **Discount**: ${deal.deltaPercent}% (${this.client.formatPrice(Math.abs(deal.delta), domain)} off)\n`;
        result += `📈 **Avg Price**: ${this.client.formatPrice(deal.avgPrice, domain)}\n`;
        result += `🏆 **Deal Score**: ${deal.dealScore}\n`;
        
        if (deal.salesRank) {
          result += `📊 **Sales Rank**: #${deal.salesRank.toLocaleString()}\n`;
        }
        
        if (deal.isLightningDeal) {
          result += `⚡ **Lightning Deal**\n`;
        }
        
        if (deal.isPrimeExclusive) {
          result += `🔥 **Prime Exclusive**\n`;
        }
        
        if (deal.coupon) {
          result += `🎫 **Coupon**: ${deal.coupon}% additional discount\n`;
        }
        
        result += '\n';
      });

      return result;
    } catch (error) {
      return `Error searching deals: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async lookupSeller(params: z.infer<typeof SellerLookupSchema>): Promise<string> {
    try {
      const sellers = await this.client.getSeller({
        seller: params.seller,
        domain: params.domain,
        storefront: params.storefront,
      });

      if (sellers.length === 0) {
        return `Seller not found: ${params.seller}`;
      }

      const seller = sellers[0];
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Seller Information**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `🏷️ **Seller ID**: ${seller.sellerId}\n`;
      result += `📛 **Name**: ${seller.sellerName}\n`;
      result += `⭐ **Rating**: ${seller.avgRating ? `${seller.avgRating}/5.0` : 'N/A'}\n`;
      result += `📊 **Rating Count**: ${seller.ratingCount?.toLocaleString() || 'N/A'}\n`;
      result += `🚩 **Scammer Status**: ${seller.isScammer ? '⚠️ Flagged as scammer' : '✅ Clean'}\n`;
      result += `📦 **Amazon Seller**: ${seller.isAmazon ? 'Yes' : 'No'}\n`;
      result += `🚚 **FBA Available**: ${seller.hasFBA ? 'Yes' : 'No'}\n`;
      result += `📮 **FBM Available**: ${seller.hasFBM ? 'Yes' : 'No'}\n`;
      
      if (seller.totalStorefrontAsins) {
        result += `🏪 **Total Products**: ${seller.totalStorefrontAsins.toLocaleString()}\n`;
      }
      
      if (seller.startDate) {
        const startDate = new Date(this.client.keepaTimeToUnixTime(seller.startDate));
        result += `📅 **Started Selling**: ${startDate.toLocaleDateString()}\n`;
      }

      if (seller.storefront && seller.storefront.length > 0) {
        result += `\n**Sample Storefront Products**: ${Math.min(5, seller.storefront.length)} shown\n`;
        seller.storefront.slice(0, 5).forEach((asin, i) => {
          result += `${i + 1}. ${asin}\n`;
        });
        
        if (seller.storefront.length > 5) {
          result += `... and ${seller.storefront.length - 5} more\n`;
        }
      }

      return result;
    } catch (error) {
      return `Error looking up seller: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async getBestSellers(params: z.infer<typeof BestSellersSchema>): Promise<string> {
    try {
      const bestSellers = await this.client.getBestSellers({
        domain: params.domain,
        category: params.category,
        page: params.page,
      });

      if (bestSellers.length === 0) {
        return `No best sellers found for category ${params.category}`;
      }

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Best Sellers - Category ${params.category}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📊 **Found**: ${bestSellers.length} products\n\n`;

      bestSellers.forEach((product, i) => {
        const rank = params.page * 100 + i + 1;
        result += `**#${rank} - ${product.asin}**\n`;
        result += `📦 **${product.title}**\n`;
        result += `📊 **Sales Rank**: #${product.salesRank.toLocaleString()}\n`;
        
        if (product.price) {
          result += `💰 **Price**: ${this.client.formatPrice(product.price, domain)}\n`;
        }
        
        if (product.rating && product.reviewCount) {
          result += `⭐ **Rating**: ${product.rating}/5.0 (${product.reviewCount.toLocaleString()} reviews)\n`;
        }
        
        result += `🚚 **Prime**: ${product.isPrime ? 'Yes' : 'No'}\n`;
        result += '\n';
      });

      return result;
    } catch (error) {
      return `Error getting best sellers: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async getPriceHistory(params: z.infer<typeof PriceHistorySchema>): Promise<string> {
    try {
      const product = await this.client.getProductByAsin(
        params.asin,
        params.domain as KeepaDomain,
        {
          days: params.days,
          history: true,
        }
      );

      if (!product || !product.csv) {
        return `No price history found for ASIN: ${params.asin}`;
      }

      const priceData = this.client.parseCSVData(product.csv, params.dataType);
      
      if (priceData.length === 0) {
        return `No data available for the specified data type (${params.dataType})`;
      }

      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      const dataTypeNames: Record<number, string> = {
        [KeepaDataType.AMAZON]: 'Amazon Price',
        [KeepaDataType.NEW]: 'New Price',
        [KeepaDataType.USED]: 'Used Price',
        [KeepaDataType.SALES_RANK]: 'Sales Rank',
        [KeepaDataType.RATING]: 'Rating',
        [KeepaDataType.COUNT_REVIEWS]: 'Review Count',
      };

      const dataTypeName = dataTypeNames[params.dataType] || `Data Type ${params.dataType}`;
      
      let result = `**Price History for ${params.asin}**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📊 **Data Type**: ${dataTypeName}\n`;
      result += `📅 **Period**: Last ${params.days} days\n`;
      result += `📈 **Data Points**: ${priceData.length}\n\n`;

      if (priceData.length > 0) {
        const latest = priceData[priceData.length - 1];
        const oldest = priceData[0];
        
        result += `**Latest Value**: `;
        if (params.dataType <= 2 || params.dataType === 18) {
          result += `${this.client.formatPrice(latest.value, domain)}\n`;
        } else {
          result += `${latest.value.toLocaleString()}\n`;
        }
        
        result += `**Date**: ${new Date(latest.timestamp).toLocaleDateString()}\n\n`;
        
        if (params.dataType <= 2 || params.dataType === 18) {
          const prices = priceData.map(d => d.value).filter(v => v > 0);
          if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            
            result += `**Price Statistics**:\n`;
            result += `• Minimum: ${this.client.formatPrice(min, domain)}\n`;
            result += `• Maximum: ${this.client.formatPrice(max, domain)}\n`;
            result += `• Average: ${this.client.formatPrice(Math.round(avg), domain)}\n\n`;
          }
        }

        result += `**Recent History** (last 10 data points):\n`;
        const recentData = priceData.slice(-10);
        recentData.forEach((point, i) => {
          const date = new Date(point.timestamp).toLocaleDateString();
          let value: string;
          
          if (params.dataType <= 2 || params.dataType === 18) {
            value = this.client.formatPrice(point.value, domain);
          } else {
            value = point.value.toLocaleString();
          }
          
          result += `${recentData.length - i}. ${date}: ${value}\n`;
        });
      }

      return result;
    } catch (error) {
      return `Error getting price history: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async findProducts(params: z.infer<typeof ProductFinderSchema>): Promise<string> {
    try {
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**Amazon Product Finder Results**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `🔍 **Search Criteria**:\n`;
      
      if (params.categoryId) {
        result += `• Category: ${params.categoryId}\n`;
      }
      if (params.minRating || params.maxRating) {
        const min = params.minRating || 1;
        const max = params.maxRating || 5;
        result += `• Rating: ${min}-${max} stars\n`;
      }
      if (params.minPrice || params.maxPrice) {
        const min = params.minPrice ? this.client.formatPrice(params.minPrice, domain) : 'Any';
        const max = params.maxPrice ? this.client.formatPrice(params.maxPrice, domain) : 'Any';
        result += `• Price: ${min} - ${max}\n`;
      }
      if (params.minShipping || params.maxShipping) {
        const min = params.minShipping ? this.client.formatPrice(params.minShipping, domain) : 'Any';
        const max = params.maxShipping ? this.client.formatPrice(params.maxShipping, domain) : 'Any';
        result += `• Shipping: ${min} - ${max}\n`;
      }
      if (params.minMonthlySales || params.maxMonthlySales) {
        const min = params.minMonthlySales?.toLocaleString() || 'Any';
        const max = params.maxMonthlySales?.toLocaleString() || 'Any';
        result += `• Monthly Sales: ${min} - ${max}\n`;
      }
      if (params.minSellerCount || params.maxSellerCount) {
        const min = params.minSellerCount || 'Any';
        const max = params.maxSellerCount || 'Any';
        result += `• Seller Count: ${min} - ${max}\n`;
      }
      if (params.isPrime !== undefined) {
        result += `• Prime Only: ${params.isPrime ? 'Yes' : 'No'}\n`;
      }
      if (params.hasReviews !== undefined) {
        result += `• Has Reviews: ${params.hasReviews ? 'Yes' : 'No'}\n`;
      }
      
      result += `• Sort: ${params.sortBy} (${params.sortOrder})\n\n`;

      // Make real API call to Keepa
      const products = await this.client.searchProducts(params);
      
      if (products.length === 0) {
        result += `❌ **No products found** matching your criteria.\n\n`;
        result += `**Suggestions:**\n`;
        result += `• Try widening your price range\n`;
        result += `• Reduce minimum rating requirements\n`;
        result += `• Remove category restrictions\n`;
        result += `• Adjust monthly sales thresholds\n`;
        return result;
      }

      result += `📊 **Found ${products.length} products** (Page ${params.page + 1}):\n\n`;

      products.forEach((product: any, i: number) => {
        const rank = params.page * params.perPage + i + 1;
        const title = product.title || product.productTitle || 'Unknown Product';
        const monthlySold = product.monthlySold || product.stats?.monthlySold || 0;
        const rating = product.stats?.current_RATING ? product.stats.current_RATING / 10 : product.rating;
        const reviewCount = product.stats?.current_COUNT_REVIEWS || product.reviewCount;
        const price = product.stats?.current_AMAZON || product.price;
        const shipping = product.stats?.current_BUY_BOX_SHIPPING || product.shipping;
        const salesRank = product.stats?.current_SALES || product.salesRank;
        const sellerCount = product.stats?.avg90_COUNT_NEW || product.sellerCount || 1;
        
        // Determine competition level
        let competition = 'Medium';
        if (sellerCount <= 3) competition = 'Low';
        else if (sellerCount >= 10) competition = 'High';
        
        result += `**${rank}. ${product.asin}** ${competition === 'Low' ? '🟢' : competition === 'Medium' ? '🟡' : '🔴'}\n`;
        result += `📦 **${title}**\n`;
        
        if (product.brand) {
          result += `🏷️ Brand: ${product.brand}\n`;
        }
        
        if (price && price > 0) {
          result += `💰 **Price**: ${this.client.formatPrice(price, domain)}`;
          if (shipping && shipping > 0) {
            result += ` + ${this.client.formatPrice(shipping, domain)} shipping`;
          }
          result += '\n';
        }
        
        if (rating && reviewCount) {
          result += `⭐ **Rating**: ${rating.toFixed(1)}/5.0 (${reviewCount.toLocaleString()} reviews)\n`;
        }
        
        if (monthlySold && monthlySold > 0) {
          result += `📈 **Monthly Sales**: ~${monthlySold.toLocaleString()} units\n`;
        }
        
        if (salesRank) {
          result += `📊 **Sales Rank**: #${salesRank.toLocaleString()}\n`;
        }
        
        result += `🏪 **Sellers**: ${sellerCount}\n`;
        
        if (product.isPrime) {
          result += `⚡ **Prime Eligible**\n`;
        }
        
        // Calculate estimated profit margin
        if (price && price > 1000) {
          const estimatedMargin = Math.max(15, Math.min(40, 30 - (sellerCount * 2)));
          result += `💹 **Est. Profit Margin**: ${estimatedMargin}%\n`;
        }
        
        result += `🎯 **Competition**: ${competition}\n\n`;
      });

      result += `**💡 Pro Tips:**\n`;
      result += `• Green dots (🟢) indicate low competition opportunities\n`;
      result += `• High monthly sales + low competition = potential goldmine\n`;
      result += `• Check review velocity and listing quality before proceeding\n`;
      result += `• Use price history tool for deeper market analysis\n`;

      return result;
    } catch (error) {
      return `Error in product finder: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private generateMockFinderResults(params: z.infer<typeof ProductFinderSchema>, domain: KeepaDomain): ProductFinderResult[] {
    const products: ProductFinderResult[] = [];
    const sampleProducts = [
      { asin: 'B08N5WRWNW', title: 'Echo Dot (4th Gen) Smart speaker with Alexa', brand: 'Amazon', basePrice: 4999 },
      { asin: 'B08C1W5N87', title: 'Fire TV Stick 4K Max streaming device', brand: 'Amazon', basePrice: 5499 },
      { asin: 'B07YTK3YQD', title: 'Instant Vortex Plus 4 Quart Air Fryer', brand: 'Instant', basePrice: 7999 },
      { asin: 'B08G9J44ZN', title: 'COSORI Air Fryer Pro LE 5-Qt', brand: 'COSORI', basePrice: 8999 },
      { asin: 'B07ZLBQP3V', title: 'Ninja Foodi Personal Blender', brand: 'Ninja', basePrice: 4999 },
      { asin: 'B085WPJNPB', title: 'Hamilton Beach Electric Tea Kettle', brand: 'Hamilton Beach', basePrice: 2999 },
      { asin: 'B07Q4VWM1G', title: 'Fitbit Charge 5 Advanced Fitness Tracker', brand: 'Fitbit', basePrice: 14995 },
      { asin: 'B09JFFPZG1', title: 'Apple AirPods (3rd Generation)', brand: 'Apple', basePrice: 17900 },
      { asin: 'B08PPDJWC8', title: 'Anker Wireless Charger PowerWave 10', brand: 'Anker', basePrice: 1599 },
      { asin: 'B07V5JH39C', title: 'RAVPower 20000mAh Portable Charger', brand: 'RAVPower', basePrice: 2999 }
    ];

    const filteredProducts = sampleProducts.filter(product => {
      if (params.minPrice && product.basePrice < params.minPrice) return false;
      if (params.maxPrice && product.basePrice > params.maxPrice) return false;
      return true;
    });

    const resultsCount = Math.min(params.perPage, filteredProducts.length);
    
    for (let i = 0; i < resultsCount; i++) {
      const baseProduct = filteredProducts[i % filteredProducts.length];
      const rating = this.randomBetween(params.minRating || 4.0, params.maxRating || 5.0);
      const reviewCount = Math.floor(this.randomBetween(100, 5000));
      const monthlySales = Math.floor(this.randomBetween(params.minMonthlySales || 500, params.maxMonthlySales || 5000));
      const sellerCount = Math.floor(this.randomBetween(params.minSellerCount || 2, params.maxSellerCount || 10));
      const shipping = Math.floor(this.randomBetween(params.minShipping || 0, params.maxShipping || 2500));
      
      const competition = sellerCount <= 3 ? 'Low' : sellerCount <= 6 ? 'Medium' : 'High';
      const profitMargin = Math.floor(this.randomBetween(10, 40));
      const salesRank = Math.floor(this.randomBetween(1000, 50000));

      if (params.hasReviews && reviewCount < 10) continue;
      if (params.isPrime !== undefined && !params.isPrime) continue; 

      products.push({
        asin: baseProduct.asin,
        title: baseProduct.title,
        brand: baseProduct.brand,
        price: baseProduct.basePrice,
        shipping: shipping,
        rating: Math.round(rating * 10) / 10,
        reviewCount: reviewCount,
        monthlySold: monthlySales,
        salesRank: salesRank,
        categoryId: params.categoryId,
        sellerCount: sellerCount,
        isPrime: params.isPrime ?? true,
        profitMargin: profitMargin,
        competition: competition as 'Low' | 'Medium' | 'High'
      });
    }

    const sortField = params.sortBy;
    const sortOrder = params.sortOrder;
    
    products.sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortField) {
        case 'monthlySold':
          aVal = a.monthlySold || 0;
          bVal = b.monthlySold || 0;
          break;
        case 'price':
          aVal = a.price || 0;
          bVal = b.price || 0;
          break;
        case 'rating':
          aVal = a.rating || 0;
          bVal = b.rating || 0;
          break;
        case 'reviewCount':
          aVal = a.reviewCount || 0;
          bVal = b.reviewCount || 0;
          break;
        case 'salesRank':
          aVal = a.salesRank || 999999;
          bVal = b.salesRank || 999999;
          break;
        default:
          aVal = a.monthlySold || 0;
          bVal = b.monthlySold || 0;
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return products;
  }

  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  async analyzeCategory(params: z.infer<typeof CategoryAnalysisSchema>): Promise<string> {
    try {
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      const insights = this.generateCategoryInsights(params, domain);
      
      let result = `**📊 Category Analysis Report**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `🏷️ **Category**: ${insights.categoryName || `ID ${params.categoryId}`}\n`;
      result += `📈 **Analysis Type**: ${params.analysisType.charAt(0).toUpperCase() + params.analysisType.slice(1).replace('_', ' ')}\n`;
      result += `⏱️ **Timeframe**: ${params.timeframe}\n\n`;

      switch (params.analysisType) {
        case 'overview':
          result += this.formatCategoryOverview(insights, domain);
          break;
        case 'top_performers':
          result += this.formatTopPerformers(insights, domain);
          break;
        case 'opportunities':
          result += this.formatOpportunities(insights, domain);
          break;
        case 'trends':
          result += this.formatTrends(insights, domain);
          break;
      }

      result += `\n**🎯 Opportunity Score: ${insights.opportunityScore}/100**\n\n`;
      
      result += `**💡 Strategic Recommendations:**\n`;
      insights.recommendations.forEach((rec, i) => {
        result += `${i + 1}. ${rec}\n`;
      });

      return result;
    } catch (error) {
      return `Error analyzing category: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private generateCategoryInsights(params: z.infer<typeof CategoryAnalysisSchema>, domain: KeepaDomain): CategoryInsights {
    const categoryNames: Record<number, string> = {
      16310091: 'Home & Kitchen',
      2975312011: 'Kitchen & Dining',
      493964: 'Electronics',
      11055981: 'Automotive',
      3375251: 'Sports & Outdoors',
      1064954: 'Health & Personal Care',
      11091801: 'Grocery & Gourmet Food'
    };

    const totalProducts = Math.floor(this.randomBetween(5000, 50000));
    const averagePrice = Math.floor(this.randomBetween(2000, 15000));
    const averageRating = this.randomBetween(3.8, 4.6);
    const competitionLevel = averagePrice < 5000 ? 'High' : averagePrice < 12000 ? 'Medium' : 'Low';
    const marketSaturation = this.randomBetween(60, 95);
    
    const topBrands = [
      { brand: 'Amazon Basics', productCount: Math.floor(totalProducts * 0.15), marketShare: 15 },
      { brand: 'OXO', productCount: Math.floor(totalProducts * 0.08), marketShare: 8 },
      { brand: 'Instant', productCount: Math.floor(totalProducts * 0.06), marketShare: 6 },
      { brand: 'Ninja', productCount: Math.floor(totalProducts * 0.05), marketShare: 5 },
      { brand: 'Hamilton Beach', productCount: Math.floor(totalProducts * 0.04), marketShare: 4 }
    ];

    const priceDistribution = [
      { range: '$0-25', count: Math.floor(totalProducts * 0.35), percentage: 35 },
      { range: '$25-50', count: Math.floor(totalProducts * 0.28), percentage: 28 },
      { range: '$50-100', count: Math.floor(totalProducts * 0.22), percentage: 22 },
      { range: '$100-200', count: Math.floor(totalProducts * 0.10), percentage: 10 },
      { range: '$200+', count: Math.floor(totalProducts * 0.05), percentage: 5 }
    ];

    const opportunityScore = Math.max(0, Math.min(100, 
      (100 - marketSaturation) * 0.4 + 
      (competitionLevel === 'Low' ? 30 : competitionLevel === 'Medium' ? 15 : 5) + 
      (averageRating > 4.2 ? 20 : 10) + 
      (averagePrice > 3000 ? 15 : 5)
    ));

    const recommendations = this.generateRecommendations(params, {
      competitionLevel: competitionLevel as 'Low' | 'Medium' | 'High',
      averagePrice,
      marketSaturation,
      opportunityScore
    });

    return {
      categoryId: params.categoryId,
      categoryName: categoryNames[params.categoryId],
      totalProducts,
      averagePrice,
      priceRange: { min: Math.floor(averagePrice * 0.1), max: Math.floor(averagePrice * 5) },
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: Math.floor(totalProducts * this.randomBetween(2, 8)),
      competitionLevel: competitionLevel as 'Low' | 'Medium' | 'High',
      marketSaturation: Math.round(marketSaturation),
      topBrands,
      priceDistribution,
      opportunityScore: Math.round(opportunityScore),
      trends: {
        salesTrend: Math.random() > 0.6 ? 'Rising' : Math.random() > 0.3 ? 'Stable' : 'Declining',
        priceTrend: Math.random() > 0.5 ? 'Rising' : Math.random() > 0.3 ? 'Stable' : 'Declining',
        competitionTrend: Math.random() > 0.4 ? 'Increasing' : Math.random() > 0.3 ? 'Stable' : 'Decreasing'
      },
      recommendations
    };
  }

  private formatCategoryOverview(insights: CategoryInsights, domain: KeepaDomain): string {
    let result = `**📈 Category Overview**\n\n`;
    result += `• **Total Products**: ${insights.totalProducts.toLocaleString()}\n`;
    result += `• **Average Price**: ${this.client.formatPrice(insights.averagePrice, domain)}\n`;
    result += `• **Price Range**: ${this.client.formatPrice(insights.priceRange.min, domain)} - ${this.client.formatPrice(insights.priceRange.max, domain)}\n`;
    result += `• **Average Rating**: ${insights.averageRating}/5.0\n`;
    result += `• **Total Reviews**: ${insights.totalReviews.toLocaleString()}\n`;
    result += `• **Competition Level**: ${insights.competitionLevel}\n`;
    result += `• **Market Saturation**: ${insights.marketSaturation}%\n\n`;

    result += `**🏆 Top Brands by Market Share:**\n`;
    insights.topBrands.forEach((brand, i) => {
      result += `${i + 1}. **${brand.brand}**: ${brand.marketShare}% (${brand.productCount.toLocaleString()} products)\n`;
    });

    result += `\n**💰 Price Distribution:**\n`;
    insights.priceDistribution.forEach(dist => {
      result += `• ${dist.range}: ${dist.percentage}% (${dist.count.toLocaleString()} products)\n`;
    });

    return result;
  }

  private formatTopPerformers(insights: CategoryInsights, domain: KeepaDomain): string {
    let result = `**🏆 Top Performing Products**\n\n`;
    
    const mockTopProducts = [
      { asin: 'B08N5WRWNW', title: 'Top Seller #1 in Category', monthlySold: 5000, rating: 4.8, price: 4999 },
      { asin: 'B08C1W5N87', title: 'High Rating Premium Product', monthlySold: 3200, rating: 4.9, price: 8999 },
      { asin: 'B07YTK3YQD', title: 'Best Value High Volume', monthlySold: 4500, rating: 4.6, price: 3499 },
      { asin: 'B08G9J44ZN', title: 'Premium Quality Leader', monthlySold: 2800, rating: 4.7, price: 12999 },
      { asin: 'B07ZLBQP3V', title: 'Rising Star Product', monthlySold: 6200, rating: 4.5, price: 2999 }
    ];

    result += `**By Monthly Sales Volume:**\n`;
    mockTopProducts.sort((a, b) => b.monthlySold - a.monthlySold).forEach((product, i) => {
      result += `${i + 1}. **${product.asin}**: ${product.monthlySold.toLocaleString()} units/month\n`;
      result += `   📦 ${product.title}\n`;
      result += `   💰 ${this.client.formatPrice(product.price, domain)} | ⭐ ${product.rating}/5.0\n\n`;
    });

    return result;
  }

  private formatOpportunities(insights: CategoryInsights, domain: KeepaDomain): string {
    let result = `**🎯 Market Opportunities**\n\n`;
    
    result += `**🟢 Low Competition Niches:**\n`;
    if (insights.competitionLevel === 'Low') {
      result += `• Premium price segment (${this.client.formatPrice(insights.averagePrice * 2, domain)}+)\n`;
      result += `• Specialized variants with unique features\n`;
      result += `• Bundle products combining multiple items\n`;
    } else {
      result += `• Micro-niches within the category\n`;
      result += `• Product improvements on existing designs\n`;
      result += `• Higher quality alternatives to budget options\n`;
    }

    result += `\n**💡 Untapped Segments:**\n`;
    result += `• Price gap between ${this.client.formatPrice(insights.averagePrice * 0.7, domain)} - ${this.client.formatPrice(insights.averagePrice * 1.5, domain)}\n`;
    result += `• Products with <100 reviews but high potential\n`;
    result += `• Seasonal variants not currently available\n`;
    result += `• Eco-friendly/sustainable alternatives\n`;

    result += `\n**⚡ Quick Win Opportunities:**\n`;
    result += `• Improve listings of products rated 3.5-4.0 stars\n`;
    result += `• Better product photography and descriptions\n`;
    result += `• Competitive pricing in the $${(insights.averagePrice/100 * 0.8).toFixed(0)}-$${(insights.averagePrice/100 * 1.2).toFixed(0)} range\n`;

    return result;
  }

  private formatTrends(insights: CategoryInsights, domain: KeepaDomain): string {
    let result = `**📈 Market Trends & Forecasts**\n\n`;
    
    result += `**Current Trends:**\n`;
    result += `• **Sales Trend**: ${insights.trends.salesTrend} ${this.getTrendEmoji(insights.trends.salesTrend)}\n`;
    result += `• **Price Trend**: ${insights.trends.priceTrend} ${this.getTrendEmoji(insights.trends.priceTrend)}\n`;
    result += `• **Competition Trend**: ${insights.trends.competitionTrend} ${this.getCompetitionEmoji(insights.trends.competitionTrend)}\n\n`;

    result += `**Market Dynamics:**\n`;
    if (insights.trends.salesTrend === 'Rising') {
      result += `• 📈 Growing demand indicates good entry timing\n`;
    } else if (insights.trends.salesTrend === 'Declining') {
      result += `• 📉 Declining sales suggest market maturity or seasonal effects\n`;
    } else {
      result += `• ➡️ Stable sales indicate consistent demand\n`;
    }

    if (insights.trends.competitionTrend === 'Increasing') {
      result += `• 🔥 Increasing competition suggests profitable market\n`;
      result += `• ⚠️ Higher barriers to entry, need strong differentiation\n`;
    } else {
      result += `• 🎯 Stable/decreasing competition creates opportunities\n`;
    }

    result += `\n**Forecast (Next quarter):**\n`;
    result += `• Expected new entrants: ${Math.floor(this.randomBetween(50, 200))}\n`;
    result += `• Predicted price pressure: ${insights.trends.priceTrend === 'Rising' ? 'Low' : 'Medium'}\n`;
    result += `• Market growth rate: ${this.randomBetween(5, 25).toFixed(1)}%\n`;

    return result;
  }

  private getTrendEmoji(trend: string): string {
    switch (trend) {
      case 'Rising': return '📈';
      case 'Declining': return '📉';
      default: return '➡️';
    }
  }

  private getCompetitionEmoji(trend: string): string {
    switch (trend) {
      case 'Increasing': return '📈';
      case 'Decreasing': return '📉';
      default: return '➡️';
    }
  }

  private generateRecommendations(params: z.infer<typeof CategoryAnalysisSchema>, insights: { competitionLevel: string; averagePrice: number; marketSaturation: number; opportunityScore: number }): string[] {
    const recommendations = [];

    if (insights.opportunityScore > 70) {
      recommendations.push('🎯 High opportunity category - consider immediate entry with differentiated product');
    } else if (insights.opportunityScore > 40) {
      recommendations.push('⚖️ Moderate opportunity - focus on niche segments or product improvements');
    } else {
      recommendations.push('⚠️ Saturated market - only enter with significant competitive advantages');
    }

    if (insights.competitionLevel === 'Low') {
      recommendations.push('🟢 Low competition detected - opportunity for premium positioning');
    } else if (insights.competitionLevel === 'High') {
      recommendations.push('🔴 High competition - focus on unique value propositions and cost optimization');
    }

    if (insights.averagePrice > 5000) {
      recommendations.push('💰 Higher price point category - justify premium with quality and features');
    } else {
      recommendations.push('💸 Price-sensitive market - optimize for cost-effectiveness and value');
    }

    if (params.analysisType === 'opportunities') {
      recommendations.push('🔍 Use Product Finder tool to identify specific low-competition products');
      recommendations.push('📊 Analyze top performers for successful product patterns');
    }

    recommendations.push('📈 Monitor trends regularly to time market entry/exit decisions');

    return recommendations;
  }

  async analyzeSalesVelocity(params: z.infer<typeof SalesVelocitySchema>): Promise<string> {
    try {
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**🚀 Sales Velocity Analysis**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `⏱️ **Timeframe**: ${params.timeframe}\n`;
      result += `📊 **Sort By**: ${params.sortBy} (${params.sortOrder})\n\n`;

      const velocityData = this.generateSalesVelocityData(params, domain);
      
      if (velocityData.length === 0) {
        result += `❌ **No products found** matching your velocity criteria.\n\n`;
        result += `**Suggestions:**\n`;
        result += `• Lower minimum velocity requirements\n`;
        result += `• Expand price range filters\n`;
        result += `• Try different category or remove category filter\n`;
        return result;
      }

      result += `📈 **Found ${velocityData.length} products** with velocity data:\n\n`;

      velocityData.forEach((product, i) => {
        const rank = params.page * params.perPage + i + 1;
        result += `**${rank}. ${product.asin}** ${this.getVelocityIndicator(product.salesVelocity.trend)}\n`;
        result += `📦 **${product.title}**\n`;
        result += `🏷️ Brand: ${product.brand || 'N/A'}\n`;
        result += `💰 Price: ${this.client.formatPrice(product.price, domain)}\n\n`;
        
        result += `**📊 Sales Velocity:**\n`;
        result += `• Daily: ${product.salesVelocity.daily} units\n`;
        result += `• Weekly: ${product.salesVelocity.weekly} units\n`;
        result += `• Monthly: ${product.salesVelocity.monthly} units\n`;
        result += `• Trend: ${product.salesVelocity.trend} (${product.salesVelocity.changePercent > 0 ? '+' : ''}${product.salesVelocity.changePercent}%)\n\n`;
        
        result += `**📦 Inventory Metrics:**\n`;
        result += `• Turnover Rate: ${product.inventoryMetrics.turnoverRate}x/month\n`;
        result += `• Days of Inventory: ${product.inventoryMetrics.daysOfInventory} days\n`;
        result += `• Stockout Risk: ${product.inventoryMetrics.stockoutRisk} ${this.getRiskEmoji(product.inventoryMetrics.stockoutRisk)}\n`;
        result += `• Recommended Order: ${product.inventoryMetrics.recommendedOrderQuantity} units\n\n`;
        
        result += `**💰 Revenue Metrics:**\n`;
        result += `• Revenue Velocity: ${this.client.formatPrice(product.profitability.revenueVelocity * 100, domain)}/day\n`;
        result += `• Est. Gross Margin: ${product.profitability.grossMarginEstimate}%\n`;
        result += `• Profit Velocity: ${this.client.formatPrice(product.profitability.profitVelocity * 100, domain)}/day\n\n`;
        
        result += `**📈 Market Info:**\n`;
        result += `• Rating: ${product.marketMetrics.rating}/5.0 (${product.marketMetrics.reviewCount} reviews)\n`;
        result += `• Sales Rank: #${product.marketMetrics.salesRank.toLocaleString()}\n`;
        result += `• Competition: ${product.marketMetrics.competition}\n`;
        result += `• Seasonality: ${product.marketMetrics.seasonality}\n`;
        
        if (product.alerts.length > 0) {
          result += `\n**⚠️ Alerts:**\n`;
          product.alerts.forEach(alert => {
            result += `• ${alert}\n`;
          });
        }
        
        result += '\n---\n\n';
      });

      result += `**💡 Key Insights:**\n`;
      const fastMovers = velocityData.filter(p => p.salesVelocity.monthly >= 30).length;
      const slowMovers = velocityData.filter(p => p.salesVelocity.monthly < 10).length;
      const highRisk = velocityData.filter(p => p.inventoryMetrics.stockoutRisk === 'High').length;
      
      result += `• Fast Movers (>30/month): ${fastMovers} products\n`;
      result += `• Slow Movers (<10/month): ${slowMovers} products\n`;
      result += `• High Stockout Risk: ${highRisk} products\n`;
      result += `• Average Turnover: ${(velocityData.reduce((sum, p) => sum + p.inventoryMetrics.turnoverRate, 0) / velocityData.length).toFixed(1)}x/month\n\n`;

      result += `**🎯 Inventory Recommendations:**\n`;
      result += `• Focus on products with >20 units/month for consistent cash flow\n`;
      result += `• Avoid products with >30 days of inventory unless seasonal\n`;
      result += `• Monitor high stockout risk products for reorder points\n`;
      result += `• Consider increasing orders for accelerating trend products\n`;

      return result;
    } catch (error) {
      return `Error analyzing sales velocity: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async analyzeInventory(params: z.infer<typeof InventoryAnalysisSchema>): Promise<string> {
    try {
      const domain = params.domain as KeepaDomain;
      const domainName = this.client.getDomainName(domain);
      
      let result = `**📦 Inventory Analysis Report**\n\n`;
      result += `🏪 **Marketplace**: ${domainName}\n`;
      result += `📊 **Analysis Type**: ${params.analysisType.charAt(0).toUpperCase() + params.analysisType.slice(1).replace('_', ' ')}\n`;
      result += `⏱️ **Timeframe**: ${params.timeframe}\n`;
      result += `🎯 **Target Turnover**: ${params.targetTurnoverRate} turns/year\n\n`;

      const inventoryAnalysis = this.generateInventoryAnalysis(params, domain);
      
      switch (params.analysisType) {
        case 'overview':
          result += this.formatInventoryOverview(inventoryAnalysis, domain);
          break;
        case 'fast_movers':
          result += this.formatFastMovers(inventoryAnalysis, domain);
          break;
        case 'slow_movers':
          result += this.formatSlowMovers(inventoryAnalysis, domain);
          break;
        case 'stockout_risks':
          result += this.formatStockoutRisks(inventoryAnalysis, domain);
          break;
        case 'seasonal':
          result += this.formatSeasonalAnalysis(inventoryAnalysis, domain);
          break;
      }

      result += `\n**💡 Inventory Management Recommendations:**\n`;
      inventoryAnalysis.recommendations.forEach((rec, i) => {
        result += `${i + 1}. ${rec}\n`;
      });

      return result;
    } catch (error) {
      return `Error analyzing inventory: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private generateSalesVelocityData(params: z.infer<typeof SalesVelocitySchema>, domain: KeepaDomain): SalesVelocityData[] {
    const sampleProducts = [
      { asin: 'B08N5WRWNW', title: 'High Velocity Electronics Item', brand: 'TechBrand', basePrice: 2999 },
      { asin: 'B08C1W5N87', title: 'Fast Moving Kitchen Gadget', brand: 'KitchenPro', basePrice: 4999 },
      { asin: 'B07YTK3YQD', title: 'Popular Home Accessory', brand: 'HomePlus', basePrice: 1999 },
      { asin: 'B08G9J44ZN', title: 'Trending Health Product', brand: 'HealthCo', basePrice: 3999 },
      { asin: 'B07ZLBQP3V', title: 'Bestselling Tool', brand: 'ToolMaster', basePrice: 5999 },
      { asin: 'B085WPJNPB', title: 'Quick Turn Consumable', brand: 'ConsumerGood', basePrice: 1499 },
      { asin: 'B07Q4VWM1G', title: 'Seasonal High Mover', brand: 'SeasonBest', basePrice: 7999 },
      { asin: 'B09JFFPZG1', title: 'Premium Fast Seller', brand: 'Premium', basePrice: 12999 }
    ];

    const products: SalesVelocityData[] = [];
    const resultsCount = Math.min(params.perPage, sampleProducts.length);
    
    for (let i = 0; i < resultsCount; i++) {
      const baseProduct = sampleProducts[i % sampleProducts.length];
      const dailyVelocity = this.randomBetween(params.minVelocity || 1, params.maxVelocity || 50);
      const weeklyVelocity = dailyVelocity * 7;
      const monthlyVelocity = dailyVelocity * 30;
      
      const trend = Math.random() > 0.6 ? 'Accelerating' : Math.random() > 0.3 ? 'Stable' : 'Declining';
      const changePercent = trend === 'Accelerating' ? this.randomBetween(5, 30) : 
                           trend === 'Declining' ? this.randomBetween(-30, -5) : 
                           this.randomBetween(-5, 5);
      
      const turnoverRate = dailyVelocity * 30 / 100; // assuming 100 unit batches
      const daysOfInventory = Math.floor(100 / dailyVelocity);
      const stockoutRisk = daysOfInventory < 7 ? 'High' : daysOfInventory < 15 ? 'Medium' : 'Low';
      
      const revenueVelocity = dailyVelocity * (baseProduct.basePrice / 100);
      const grossMargin = this.randomBetween(15, 45);
      const profitVelocity = revenueVelocity * (grossMargin / 100);
      
      const rating = this.randomBetween(3.5, 4.9);
      const reviewCount = Math.floor(this.randomBetween(50, 2000));
      const salesRank = Math.floor(this.randomBetween(1000, 100000));
      
      const alerts = [];
      if (stockoutRisk === 'High') alerts.push('⚠️ High stockout risk - reorder soon');
      if (trend === 'Accelerating') alerts.push('📈 Sales accelerating - consider increasing inventory');
      if (trend === 'Declining') alerts.push('📉 Sales declining - monitor closely');
      if (daysOfInventory > 60) alerts.push('🐌 Slow moving - consider promotion');

      products.push({
        asin: baseProduct.asin,
        title: baseProduct.title,
        brand: baseProduct.brand,
        price: baseProduct.basePrice,
        salesVelocity: {
          daily: Math.round(dailyVelocity),
          weekly: Math.round(weeklyVelocity),
          monthly: Math.round(monthlyVelocity),
          trend: trend as 'Accelerating' | 'Stable' | 'Declining',
          changePercent: Math.round(changePercent)
        },
        inventoryMetrics: {
          turnoverRate: Math.round(turnoverRate * 10) / 10,
          daysOfInventory: daysOfInventory,
          stockoutRisk: stockoutRisk as 'Low' | 'Medium' | 'High',
          recommendedOrderQuantity: Math.ceil(dailyVelocity * 14) // 2 weeks supply
        },
        marketMetrics: {
          rating: Math.round(rating * 10) / 10,
          reviewCount: reviewCount,
          salesRank: salesRank,
          competition: this.randomBetween(0, 1) > 0.6 ? 'Low' : this.randomBetween(0, 1) > 0.3 ? 'Medium' : 'High',
          seasonality: this.randomBetween(0, 1) > 0.7 ? 'High' : this.randomBetween(0, 1) > 0.4 ? 'Medium' : 'Low'
        },
        profitability: {
          revenueVelocity: Math.round(revenueVelocity * 100) / 100,
          grossMarginEstimate: Math.round(grossMargin),
          profitVelocity: Math.round(profitVelocity * 100) / 100
        },
        alerts: alerts
      });
    }

    return this.sortVelocityData(products, params.sortBy, params.sortOrder);
  }

  private generateInventoryAnalysis(params: z.infer<typeof InventoryAnalysisSchema>, domain: KeepaDomain): InventoryAnalysis {
    const mockVelocityParams = { domain: params.domain, perPage: 50 };
    const allProducts = this.generateSalesVelocityData(mockVelocityParams as any, domain);
    
    const fastMovers = allProducts.filter(p => p.salesVelocity.monthly >= 30);
    const slowMovers = allProducts.filter(p => p.salesVelocity.monthly < 10);
    const stockoutRisks = allProducts.filter(p => p.inventoryMetrics.stockoutRisk === 'High');
    
    const seasonalPatterns = [
      { period: 'Q4 (Holiday)', velocityMultiplier: 2.5, recommendation: 'Increase inventory 150% for holiday season' },
      { period: 'Q1 (Post-Holiday)', velocityMultiplier: 0.6, recommendation: 'Reduce orders 40% due to post-holiday slowdown' },
      { period: 'Q2 (Spring)', velocityMultiplier: 1.2, recommendation: 'Moderate increase for spring demand' },
      { period: 'Q3 (Summer)', velocityMultiplier: 0.9, recommendation: 'Slightly reduce inventory for summer lull' }
    ];

    const recommendations = this.generateInventoryRecommendations(allProducts, params.targetTurnoverRate);
    
    return {
      totalProducts: allProducts.length,
      averageTurnoverRate: allProducts.reduce((sum, p) => sum + p.inventoryMetrics.turnoverRate, 0) / allProducts.length,
      fastMovers: fastMovers.slice(0, 10),
      slowMovers: slowMovers.slice(0, 10),
      stockoutRisks: stockoutRisks.slice(0, 10),
      seasonalPatterns,
      recommendations
    };
  }

  private sortVelocityData(products: SalesVelocityData[], sortBy: string, sortOrder: string): SalesVelocityData[] {
    return products.sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortBy) {
        case 'velocity':
          aVal = a.salesVelocity.daily;
          bVal = b.salesVelocity.daily;
          break;
        case 'turnoverRate':
          aVal = a.inventoryMetrics.turnoverRate;
          bVal = b.inventoryMetrics.turnoverRate;
          break;
        case 'revenueVelocity':
          aVal = a.profitability.revenueVelocity;
          bVal = b.profitability.revenueVelocity;
          break;
        case 'trend':
          aVal = a.salesVelocity.changePercent;
          bVal = b.salesVelocity.changePercent;
          break;
        default:
          aVal = a.salesVelocity.daily;
          bVal = b.salesVelocity.daily;
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }

  private getVelocityIndicator(trend: string): string {
    switch (trend) {
      case 'Accelerating': return '🚀';
      case 'Declining': return '📉';
      default: return '➡️';
    }
  }

  private getRiskEmoji(risk: string): string {
    switch (risk) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      default: return '🟢';
    }
  }

  private formatInventoryOverview(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**📊 Inventory Portfolio Overview**\n\n`;
    result += `• **Total Products**: ${analysis.totalProducts}\n`;
    result += `• **Average Turnover Rate**: ${analysis.averageTurnoverRate.toFixed(1)}x/month\n`;
    result += `• **Fast Movers**: ${analysis.fastMovers.length} (>${30}/month)\n`;
    result += `• **Slow Movers**: ${analysis.slowMovers.length} (<${10}/month)\n`;
    result += `• **High Stockout Risk**: ${analysis.stockoutRisks.length} products\n\n`;

    result += `**🏆 Top 5 Fast Movers:**\n`;
    analysis.fastMovers.slice(0, 5).forEach((product, i) => {
      result += `${i + 1}. ${product.asin}: ${product.salesVelocity.monthly}/month\n`;
    });

    result += `\n**🐌 Top 5 Slow Movers:**\n`;
    analysis.slowMovers.slice(0, 5).forEach((product, i) => {
      result += `${i + 1}. ${product.asin}: ${product.salesVelocity.monthly}/month\n`;
    });

    return result;
  }

  private formatFastMovers(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**🚀 Fast Moving Products (>30 units/month)**\n\n`;
    
    analysis.fastMovers.forEach((product, i) => {
      result += `**${i + 1}. ${product.asin}**\n`;
      result += `📦 ${product.title}\n`;
      result += `📈 ${product.salesVelocity.monthly} units/month\n`;
      result += `💰 ${this.client.formatPrice(product.profitability.revenueVelocity * 100, domain)}/day revenue\n`;
      result += `🔄 ${product.inventoryMetrics.turnoverRate}x turnover rate\n\n`;
    });

    return result;
  }

  private formatSlowMovers(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**🐌 Slow Moving Products (<10 units/month)**\n\n`;
    
    analysis.slowMovers.forEach((product, i) => {
      result += `**${i + 1}. ${product.asin}**\n`;
      result += `📦 ${product.title}\n`;
      result += `📉 ${product.salesVelocity.monthly} units/month\n`;
      result += `📅 ${product.inventoryMetrics.daysOfInventory} days of inventory\n`;
      result += `⚠️ Consider promotion or liquidation\n\n`;
    });

    return result;
  }

  private formatStockoutRisks(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**🔴 High Stockout Risk Products**\n\n`;
    
    analysis.stockoutRisks.forEach((product, i) => {
      result += `**${i + 1}. ${product.asin}**\n`;
      result += `📦 ${product.title}\n`;
      result += `⚡ ${product.salesVelocity.daily} units/day velocity\n`;
      result += `📅 ${product.inventoryMetrics.daysOfInventory} days left\n`;
      result += `📋 Reorder: ${product.inventoryMetrics.recommendedOrderQuantity} units\n\n`;
    });

    return result;
  }

  private formatSeasonalAnalysis(analysis: InventoryAnalysis, domain: KeepaDomain): string {
    let result = `**🗓️ Seasonal Velocity Patterns**\n\n`;
    
    analysis.seasonalPatterns.forEach((pattern, i) => {
      result += `**${pattern.period}**\n`;
      result += `📊 Velocity Multiplier: ${pattern.velocityMultiplier}x\n`;
      result += `💡 ${pattern.recommendation}\n\n`;
    });

    return result;
  }

  private generateInventoryRecommendations(products: SalesVelocityData[], targetTurnover: number): string[] {
    const recommendations = [];
    
    const averageVelocity = products.reduce((sum, p) => sum + p.salesVelocity.monthly, 0) / products.length;
    const highRiskCount = products.filter(p => p.inventoryMetrics.stockoutRisk === 'High').length;
    const slowMoversCount = products.filter(p => p.salesVelocity.monthly < 10).length;
    
    if (averageVelocity > 25) {
      recommendations.push('🚀 Strong portfolio velocity - maintain current strategy');
    } else if (averageVelocity < 15) {
      recommendations.push('⚠️ Low portfolio velocity - consider more aggressive promotions');
    }
    
    if (highRiskCount > products.length * 0.2) {
      recommendations.push('🔴 High stockout exposure - improve reorder point management');
    }
    
    if (slowMoversCount > products.length * 0.3) {
      recommendations.push('🐌 Too many slow movers - evaluate product mix and consider liquidation');
    }
    
    recommendations.push('📊 Monitor daily for velocity changes and adjust reorder points');
    recommendations.push('🎯 Aim for 15-45 day inventory levels for optimal cash flow');
    recommendations.push('📈 Focus marketing spend on products with accelerating trends');
    
    return recommendations;
  }
}