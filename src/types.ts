export interface KeepaConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  rateLimitDelay?: number;
}

export interface KeepaProduct {
  asin: string;
  domainId: number;
  title?: string;
  brand?: string;
  manufacturer?: string;
  productGroup?: string;
  partNumber?: string;
  model?: string;
  color?: string;
  size?: string;
  edition?: string;
  format?: string;
  packageHeight?: number;
  packageLength?: number;
  packageWidth?: number;
  packageWeight?: number;
  packageQuantity?: number;
  isAdultProduct?: boolean;
  isEligibleForTradeIn?: boolean;
  isEligibleForSuperSaverShipping?: boolean;
  offers?: KeepaOffer[];
  stats?: KeepaStats;
  imagesCSV?: string;
  categoryTree?: KeepaCategory[];
  parent?: string;
  variations?: string[];
  frequentlyBoughtTogether?: string[];
  buyBoxSellerIdHistory?: number[][];
  isRedirectASIN?: boolean;
  isSNS?: boolean;
  offerId?: number;
  oneHourOfferCount?: number;
  type?: string;
  hazardousMaterialType?: number;
  availabilityAmazon?: number;
  csv?: number[][];
}

export interface KeepaOffer {
  offerId: number;
  lastSeen: number;
  sellerId?: string;
  isPrime: boolean;
  isFBA: boolean;
  isMAP: boolean;
  isShippedByAmazon: boolean;
  isAmazon: boolean;
  isBuyBoxWinner: boolean;
  isUsed: boolean;
  offerCSV?: string;
  primeExclusive: boolean;
  isWarehouseDeal: boolean;
  isScam: boolean;
  shippingStr?: string;
  conditionComment?: string;
  condition: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

export interface KeepaStats {
  current: number[];
  avg: number[];
  atIntervalStart: number[];
  min: number[];
  max: number[];
  minInInterval: number[];
  maxInInterval: number[];
  out: number[];
  total: number[];
  retrievedOfferCount: number;
  buyBoxPrice?: number;
  buyBoxShipping?: number;
  buyBoxUsedPrice?: number;
  buyBoxUsedShipping?: number;
  salesRankReference?: number;
  salesRankReferenceDrop?: number;
  outOfStockPercentage30?: number;
  outOfStockPercentage90?: number;
  lightningDealInfo?: number[];
  couponHistory?: number[][];
  promotionHistory?: number[][];
}

export interface KeepaCategory {
  catId: number;
  name: string;
  children?: KeepaCategory[];
  parent?: number;
}

export interface KeepaDeal {
  asin: string;
  title: string;
  brand?: string;
  price: number;
  shipping: number;
  categoryTree: KeepaCategory[];
  salesRank: number;
  salesRankReference?: number;
  deltaPercent: any; // Can be number or array - Deal object documentation shows arrays
  delta: any; // Can be number or array  
  avgPrice: number;
  range: string;
  isLightningDeal: boolean;
  isPrimeExclusive: boolean;
  coupon?: number;
  promotion?: string;
  imageUrl?: string;
  domainId: number;
  dealScore: number;
  lightningEnd?: number; // Lightning deal end time in Keepa minutes
  warehouseCondition?: number; // Warehouse deal condition
  warehouseConditionComment?: string;
}

export interface KeepaSeller {
  sellerId: string;
  sellerName: string;
  isScammer: boolean;
  hasFBM: boolean;
  hasFBA: boolean;
  isAmazon: boolean;
  totalStorefrontAsins?: number;
  avgRating?: number;
  ratingCount?: number;
  startDate?: number;
  sellerCSV?: string;
  storefront?: string[];
}

export interface KeepaBestSeller {
  asin: string;
  title: string;
  salesRank: number;
  categoryId: number;
  price?: number;
  isPrime: boolean;
  rating?: number;
  reviewCount: number;
  imageUrl?: string;
}

export interface KeepaApiResponse<T> {
  timestamp: number;
  tokensLeft: number;
  tokensConsumed: number;
  processingTimeInMs: number;
  version: string;
  statusCode: number;
  data?: T;
  error?: string;
}

export interface KeepaQueryResponse extends KeepaApiResponse<null> {
  asinList: string[];
  totalResults: number;
  refillIn?: number;
  refillRate?: number;
  tokenFlowReduction?: number;
}

export interface ProductQueryParams {
  asin?: string;
  asins?: string[];
  domain?: number;
  code?: string;
  days?: number;
  startdate?: number;
  enddate?: number;
  update?: number;
  history?: boolean;
  rating?: boolean;
  offers?: number;
  buybox?: boolean;
  fbafees?: boolean;
  variations?: boolean;
  onlylivefbafees?: boolean;
  categories?: boolean;
  update_ver?: number;
  stock?: boolean;
  product_codes?: number;
  promotions?: boolean;
  coupon_history?: boolean;
  lightning_deals?: boolean;
  stats?: number; // Statistics data (1 = enable, provides FREE sales velocity and inventory analytics)
}

export interface DealQueryParams {
  domainId: number;
  dealType?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  minRating?: number;
  isPrime?: boolean;
  sortType?: number;
  page?: number;
  perPage?: number;
}

export interface SellerQueryParams {
  seller?: string;
  domain?: number;
  storefront?: number;
  update?: number;
}

export interface BestSellerQueryParams {
  domain: number;
  category: number;
  page?: number;
}

export interface ProductFinderParams {
  domain?: number;
  categoryId?: number;
  minRating?: number;
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
  minShipping?: number;
  maxShipping?: number;
  minMonthlySales?: number;
  maxMonthlySales?: number;
  minSellerCount?: number;
  maxSellerCount?: number;
  isPrime?: boolean;
  hasReviews?: boolean;
  productType?: number;
  sortBy?: 'monthlySold' | 'price' | 'rating' | 'reviewCount' | 'salesRank';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface ProductFinderResult {
  asin: string;
  title: string;
  brand?: string;
  price?: number;
  shipping?: number;
  rating?: number;
  reviewCount?: number;
  monthlySold?: number;
  salesRank?: number;
  categoryId?: number;
  sellerCount?: number;
  isPrime?: boolean;
  imageUrl?: string;
  profitMargin?: number;
  competition?: 'Low' | 'Medium' | 'High';
}

export interface CategoryAnalysisParams {
  domain?: number;
  categoryId: number;
  analysisType?: 'overview' | 'top_performers' | 'opportunities' | 'trends';
  priceRange?: 'budget' | 'mid' | 'premium' | 'luxury';
  minRating?: number;
  includeSubcategories?: boolean;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

export interface CategoryInsights {
  categoryId: number;
  categoryName?: string;
  totalProducts: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  averageRating: number;
  totalReviews: number;
  competitionLevel: 'Low' | 'Medium' | 'High';
  marketSaturation: number;
  topBrands: Array<{ brand: string; productCount: number; marketShare: number }>;
  priceDistribution: Array<{ range: string; count: number; percentage: number }>;
  opportunityScore: number;
  trends: {
    salesTrend: 'Rising' | 'Stable' | 'Declining';
    priceTrend: 'Rising' | 'Stable' | 'Declining';
    competitionTrend: 'Increasing' | 'Stable' | 'Decreasing';
  };
  recommendations: string[];
}

export interface SalesVelocityParams {
  domain?: number;
  categoryId?: number;
  asin?: string;
  asins?: string[];
  timeframe?: 'week' | 'month' | 'quarter';
  minVelocity?: number;
  maxVelocity?: number;
  priceRange?: { min?: number; max?: number };
  minRating?: number;
  sortBy?: 'velocity' | 'turnoverRate' | 'revenueVelocity' | 'trend';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface SalesVelocityData {
  asin: string;
  title: string;
  brand?: string;
  price: number;
  salesVelocity: {
    daily: number;
    weekly: number;
    monthly: number;
    trend: 'Accelerating' | 'Stable' | 'Declining';
    changePercent: number;
  };
  inventoryMetrics: {
    turnoverRate: number; // times per month
    daysOfInventory: number; // days to sell current stock
    stockoutRisk: 'Low' | 'Medium' | 'High';
    recommendedOrderQuantity: number;
  };
  marketMetrics: {
    rating: number;
    reviewCount: number;
    salesRank: number;
    competition: 'Low' | 'Medium' | 'High';
    seasonality: 'Low' | 'Medium' | 'High';
  };
  profitability: {
    revenueVelocity: number; // revenue per day
    grossMarginEstimate: number;
    profitVelocity: number; // profit per day
  };
  alerts: string[];
}

export interface InventoryAnalysis {
  totalProducts: number;
  averageTurnoverRate: number;
  fastMovers: SalesVelocityData[]; // >30 sales/month
  slowMovers: SalesVelocityData[]; // <5 sales/month
  stockoutRisks: SalesVelocityData[];
  seasonalPatterns: Array<{
    period: string;
    velocityMultiplier: number;
    recommendation: string;
  }>;
  recommendations: string[];
}

export enum KeepaDomain {
  US = 1,
  UK = 2,
  DE = 3,
  FR = 4,
  JP = 5,
  CA = 6,
  CN = 7,
  IT = 8,
  ES = 9,
  IN = 10,
  MX = 11
}

export enum KeepaDataType {
  AMAZON = 0,
  NEW = 1,
  USED = 2,
  SALES_RANK = 3,
  LISTING_COUNT = 4,
  COLLECTIBLE = 5,
  REFURBISHED = 6,
  NEW_FBM = 7,
  LIGHTNING_DEAL = 8,
  WAREHOUSE = 9,
  NEW_FBA = 10,
  COUNT_NEW = 11,
  COUNT_USED = 12,
  COUNT_REFURBISHED = 13,
  COUNT_COLLECTIBLE = 14,
  EXTRA_INFO_UPDATES = 15,
  RATING = 16,
  COUNT_REVIEWS = 17,
  BUY_BOX = 18,
  USED_NEW_SHIPPING = 19,
  USED_VERY_GOOD_SHIPPING = 20,
  USED_GOOD_SHIPPING = 21,
  USED_ACCEPTABLE_SHIPPING = 22,
  COLLECTIBLE_NEW_SHIPPING = 23,
  COLLECTIBLE_VERY_GOOD_SHIPPING = 24,
  COLLECTIBLE_GOOD_SHIPPING = 25,
  COLLECTIBLE_ACCEPTABLE_SHIPPING = 26,
  REFURBISHED_SHIPPING = 27,
  BUY_BOX_SHIPPING = 28,
  NEW_SHIPPING = 29,
  TRADE_IN = 30
}

export class KeepaError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public tokensLeft?: number
  ) {
    super(message);
    this.name = 'KeepaError';
  }
}

// Verified Amazon Category IDs for US marketplace
// These IDs have been confirmed to work with the Keepa API
export const VERIFIED_AMAZON_CATEGORIES = {
  // Top Level Categories
  'Alexa Skills': 96814,
  'Amazon Autos': 32373,
  'Amazon Devices & Accessories': 402,
  'Appliances': 2619525011, // VERIFIED: was 1544480
  'Apps & Games': 2350149011, // VERIFIED: was 797212
  'Arts, Crafts & Sewing': 2617941011, // VERIFIED: was 13835970
  'Audible Books & Originals': 18145289011, // VERIFIED: was 783083
  'Automotive': 15684181, // VERIFIED: was 50495523
  'Baby Products': 165796011, // VERIFIED: was 3032803
  'Beauty & Personal Care': 3760911, // VERIFIED: was 11064046
  'Books': 283155, // VERIFIED: was 97748196
  'CDs & Vinyl': 5174, // VERIFIED: was 7192227
  'Cell Phones & Accessories': 2335752011, // VERIFIED: was 24244925
  'Clothing, Shoes & Jewelry': 7141123011, // VERIFIED: was 242171273
  'Collectibles & Fine Art': 4991425011, // VERIFIED: was 5218518
  'Credit & Payment Cards': 3561432011, // VERIFIED: was 62
  'Digital Music': 163856011, // VERIFIED: was 54716226
  'Electronics': 172282, // Verified from API query syntax (was 23161322, 493964)
  'Everything Else': 10272111, // VERIFIED: was 1268701
  'Gift Cards': 2238192011, // VERIFIED: was 37093
  'Grocery & Gourmet Food': 16310101, // VERIFIED: was 3301351
  'Handmade Products': 11260432011, // VERIFIED: was 1209104
  'Health & Household': 3760901, // VERIFIED: was 8773677
  'Home & Kitchen': 1055398, // VERIFIED: was 130316507,
  'Industrial & Scientific': 16310091, // Verified from API query syntax
  'Kindle Store': 133140011, // VERIFIED: was 5258707
  'Luxury Stores': 18981045011, // VERIFIED: was 33210
  'Magazine Subscriptions': 599858, // VERIFIED: was 4613
  'Movies & TV': 2625373011, // VERIFIED: was 7631976
  'Musical Instruments': 11091801, // VERIFIED: was 2735580
  'Office Products': 1064954, // VERIFIED: was 11223237,
  'Patio, Lawn & Garden': 2972638011, // VERIFIED: was 20234413
  'Pet Supplies': 2619533011, // VERIFIED: was 7144114
  'Prime Video': 2858778011, // VERIFIED: was 8465
  'Software': 229534, // VERIFIED: was 129132
  'Sports & Outdoors': 3375251, // VERIFIED: was 27136078,
  'Tools & Home Improvement': 228013, // VERIFIED: was 32132196
  'Toys & Games': 165793011, // VERIFIED: was 7385282
  'Video Games': 468642, // VERIFIED: was 996441
  'Video Shorts': 9013971011 // VERIFIED: was 215456
} as const;

// Helper function to get category name from ID
export function getCategoryName(categoryId: number): string | undefined {
  const entries = Object.entries(VERIFIED_AMAZON_CATEGORIES);
  const found = entries.find(([, id]) => id === categoryId);
  return found?.[0];
}

// Helper function to get category ID from name
export function getCategoryId(categoryName: string): number | undefined {
  return VERIFIED_AMAZON_CATEGORIES[categoryName as keyof typeof VERIFIED_AMAZON_CATEGORIES];
}

// Get all available category names
export function getAvailableCategories(): string[] {
  return Object.keys(VERIFIED_AMAZON_CATEGORIES);
}