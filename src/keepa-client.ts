import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  KeepaConfig,
  KeepaProduct,
  KeepaDeal,
  KeepaSeller,
  KeepaBestSeller,
  KeepaApiResponse,
  ProductQueryParams,
  DealQueryParams,
  SellerQueryParams,
  BestSellerQueryParams,
  KeepaError,
  KeepaDomain
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
      const { statusCode, error: errorMessage } = error.response.data;
      throw new KeepaError(
        errorMessage || 'API request failed',
        statusCode,
        error.response.data.tokensLeft
      );
    }
    throw new KeepaError(error.message || 'Network error');
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

    const response = await this.makeRequest<{ products: KeepaProduct[] }>('/product', queryParams);
    return response.data?.products || [];
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

    for (let i = 0; i < asins.length; i += batchSize) {
      const batch = asins.slice(i, i + batchSize);
      const products = await this.getProduct({
        asins: batch,
        domain,
        ...options
      });
      results.push(...products);
    }

    return results;
  }

  async getDeals(params: DealQueryParams): Promise<KeepaDeal[]> {
    const response = await this.makeRequest<{ deals: KeepaDeal[] }>('/deal', params);
    return response.data?.deals || [];
  }

  async getSeller(params: SellerQueryParams): Promise<KeepaSeller[]> {
    const response = await this.makeRequest<{ sellers: KeepaSeller[] }>('/seller', params);
    return response.data?.sellers || [];
  }

  async getBestSellers(params: BestSellerQueryParams): Promise<KeepaBestSeller[]> {
    const response = await this.makeRequest<{ bestSellersList: KeepaBestSeller[] }>('/bestsellers', params);
    return response.data?.bestSellersList || [];
  }

  async searchProducts(params: any): Promise<any[]> {
    // Convert our parameter names to Keepa API format
    const keepaParams: any = {
      domain: params.domain || 1,
      page: params.page || 0,
      perPage: params.perPage || 25,
    };

    // Map our parameters to Keepa's expected format
    if (params.categoryId) keepaParams.rootCategory = params.categoryId;
    if (params.minRating) keepaParams.current_RATING_gte = Math.round(params.minRating * 10);
    if (params.maxRating) keepaParams.current_RATING_lte = Math.round(params.maxRating * 10);
    if (params.minPrice) keepaParams.current_AMAZON_gte = params.minPrice;
    if (params.maxPrice) keepaParams.current_AMAZON_lte = params.maxPrice;
    if (params.minShipping) keepaParams.current_BUY_BOX_SHIPPING_gte = params.minShipping;
    if (params.maxShipping) keepaParams.current_BUY_BOX_SHIPPING_lte = params.maxShipping;
    if (params.minMonthlySales) keepaParams.monthlySold_gte = params.minMonthlySales;
    if (params.maxMonthlySales) keepaParams.monthlySold_lte = params.maxMonthlySales;
    if (params.minSellerCount) keepaParams.avg90_COUNT_NEW_gte = params.minSellerCount;
    if (params.maxSellerCount) keepaParams.avg90_COUNT_NEW_lte = params.maxSellerCount;
    if (params.productType !== undefined) keepaParams.productType = [params.productType.toString()];
    if (params.isPrime) keepaParams.isPrime = params.isPrime;

    // Sort parameters
    if (params.sortBy) {
      const sortMap: { [key: string]: string } = {
        monthlySold: 'monthlySold',
        price: 'current',
        rating: 'current_RATING',
        reviewCount: 'current_COUNT_REVIEWS',
        salesRank: 'current_SALES'
      };
      keepaParams.sort = [[sortMap[params.sortBy] || 'monthlySold', params.sortOrder || 'desc']];
    }

    const response = await this.makeRequest<{ products: any[] }>('/search', keepaParams);
    return response.data?.products || [];
  }

  async getTokensLeft(): Promise<number> {
    const response = await this.makeRequest('/token');
    return response.tokensLeft;
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