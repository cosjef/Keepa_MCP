#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { KeepaClient } from './keepa-client.js';
import { 
  KeepaTools,
  ProductLookupSchema,
  BatchProductLookupSchema,
  DealSearchSchema,
  SellerLookupSchema,
  BestSellersSchema,
  PriceHistorySchema,
  ProductFinderSchema,
  CategoryAnalysisSchema,
  SalesVelocitySchema,
  InventoryAnalysisSchema,
  TokenStatusSchema,
} from './tools.js';

class KeepaServer {
  private server: Server;
  private keepaClient?: KeepaClient;
  private keepaTools?: KeepaTools;

  constructor() {
    this.server = new Server(
      {
        name: 'keepa-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private initializeKeepaClient(): void {
    const apiKey = process.env.KEEPA_API_KEY;
    if (!apiKey) {
      throw new Error(
        'KEEPA_API_KEY environment variable is required. ' +
        'Get your API key at https://keepa.com/#!api'
      );
    }

    this.keepaClient = new KeepaClient({
      apiKey,
      rateLimitDelay: parseInt(process.env.KEEPA_RATE_LIMIT_DELAY || '1000'),
      timeout: parseInt(process.env.KEEPA_TIMEOUT || '30000'),
    });

    this.keepaTools = new KeepaTools(this.keepaClient);
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'keepa_product_lookup',
          description: 'Look up detailed information for a single Amazon product by ASIN',
          inputSchema: {
            type: 'object',
            properties: {
              asin: { type: 'string', description: 'Amazon ASIN (product identifier)' },
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              days: { type: 'number', minimum: 1, maximum: 365, description: 'Number of days of price history to include' },
              history: { type: 'boolean', default: false, description: 'Include full price history' },
              offers: { type: 'number', minimum: 0, maximum: 100, description: 'Number of marketplace offers to include' },
              variations: { type: 'boolean', default: false, description: 'Include product variations' },
              rating: { type: 'boolean', default: false, description: 'Include product rating data' }
            },
            required: ['asin']
          }
        },
        {
          name: 'keepa_batch_product_lookup', 
          description: 'Look up information for multiple Amazon products by ASIN (up to 100)',
          inputSchema: {
            type: 'object',
            properties: {
              asins: { type: 'array', items: { type: 'string' }, maxItems: 100, description: 'Array of Amazon ASINs (max 100)' },
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              days: { type: 'number', minimum: 1, maximum: 365, description: 'Number of days of price history to include' },
              history: { type: 'boolean', default: false, description: 'Include full price history' }
            },
            required: ['asins']
          }
        },
        {
          name: 'keepa_search_deals',
          description: 'Search for current Amazon deals with filtering options',
          inputSchema: {
            type: 'object',
            properties: {
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              categoryId: { type: 'number', description: 'Amazon category ID to filter by' },
              minPrice: { type: 'number', minimum: 0, description: 'Minimum price in cents' },
              maxPrice: { type: 'number', minimum: 0, description: 'Maximum price in cents' },
              minDiscount: { type: 'number', minimum: 0, maximum: 100, description: 'Minimum discount percentage' },
              minRating: { type: 'number', minimum: 1, maximum: 5, description: 'Minimum product rating (1-5 stars)' },
              isPrime: { type: 'boolean', description: 'Filter for Prime eligible deals only' },
              sortType: { type: 'number', minimum: 0, maximum: 4, default: 0, description: 'Sort type (0=deal score, 1=price, 2=discount, 3=rating, 4=reviews)' },
              page: { type: 'number', minimum: 0, default: 0, description: 'Page number for pagination' },
              perPage: { type: 'number', minimum: 1, maximum: 50, default: 25, description: 'Results per page (max 50)' }
            },
            required: ['domain']
          }
        },
        {
          name: 'keepa_seller_lookup',
          description: 'Get detailed information about an Amazon seller',
          inputSchema: {
            type: 'object',
            properties: {
              seller: { type: 'string', description: 'Seller ID or name' },
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              storefront: { type: 'number', minimum: 0, maximum: 100000, description: 'Number of storefront ASINs to retrieve' }
            },
            required: ['seller']
          }
        },
        {
          name: 'keepa_best_sellers',
          description: 'Get best sellers list for a specific Amazon category',
          inputSchema: {
            type: 'object',
            properties: {
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              category: { type: 'number', description: 'Amazon category ID' },
              page: { type: 'number', minimum: 0, default: 0, description: 'Page number for pagination' }
            },
            required: ['category']
          }
        },
        {
          name: 'keepa_price_history',
          description: 'Get historical price data for an Amazon product',
          inputSchema: {
            type: 'object',
            properties: {
              asin: { type: 'string', description: 'Amazon ASIN (product identifier)' },
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              dataType: { type: 'number', minimum: 0, maximum: 30, description: 'Data type (0=Amazon, 1=New, 2=Used, 3=Sales Rank, etc.)' },
              days: { type: 'number', minimum: 1, maximum: 365, default: 30, description: 'Number of days of history' }
            },
            required: ['asin', 'dataType']
          }
        },
        {
          name: 'keepa_product_finder',
          description: 'Advanced product finder with filtering similar to Keepa Product Finder - find products by rating, price, sales, competition level',
          inputSchema: {
            type: 'object',
            properties: {
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              categoryId: { type: 'number', description: 'Amazon category ID to search within' },
              minRating: { type: 'number', minimum: 1, maximum: 5, description: 'Minimum product rating (1-5 stars)' },
              maxRating: { type: 'number', minimum: 1, maximum: 5, description: 'Maximum product rating (1-5 stars)' },
              minPrice: { type: 'number', minimum: 0, description: 'Minimum price in cents' },
              maxPrice: { type: 'number', minimum: 0, description: 'Maximum price in cents' },
              minShipping: { type: 'number', minimum: 0, description: 'Minimum shipping cost in cents' },
              maxShipping: { type: 'number', minimum: 0, description: 'Maximum shipping cost in cents' },
              minMonthlySales: { type: 'number', minimum: 0, description: 'Minimum estimated monthly sales' },
              maxMonthlySales: { type: 'number', minimum: 0, description: 'Maximum estimated monthly sales' },
              minSellerCount: { type: 'number', minimum: 0, description: 'Minimum number of sellers (lower = less competition)' },
              maxSellerCount: { type: 'number', minimum: 0, description: 'Maximum number of sellers (higher = more competition)' },
              isPrime: { type: 'boolean', description: 'Filter for Prime eligible products only' },
              hasReviews: { type: 'boolean', description: 'Filter for products with reviews only' },
              productType: { type: 'number', minimum: 0, maximum: 2, default: 0, description: 'Product type (0=standard, 1=variation parent, 2=variation child)' },
              sortBy: { type: 'string', enum: ['monthlySold', 'price', 'rating', 'reviewCount', 'salesRank'], default: 'monthlySold', description: 'Sort results by field' },
              sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Sort order (ascending or descending)' },
              page: { type: 'number', minimum: 0, default: 0, description: 'Page number for pagination' },
              perPage: { type: 'number', minimum: 1, maximum: 50, default: 25, description: 'Results per page (max 50)' }
            },
            required: []
          }
        },
        {
          name: 'keepa_category_analysis',
          description: 'Comprehensive category analysis - find the best products, opportunities, and market insights in any category',
          inputSchema: {
            type: 'object',
            properties: {
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              categoryId: { type: 'number', description: 'Amazon category ID to analyze' },
              analysisType: { type: 'string', enum: ['overview', 'top_performers', 'opportunities', 'trends'], default: 'overview', description: 'Type of analysis to perform' },
              priceRange: { type: 'string', enum: ['budget', 'mid', 'premium', 'luxury'], description: 'Focus on specific price range' },
              minRating: { type: 'number', minimum: 1, maximum: 5, default: 3.0, description: 'Minimum rating for products to include' },
              includeSubcategories: { type: 'boolean', default: false, description: 'Include analysis of subcategories' },
              timeframe: { type: 'string', enum: ['week', 'month', 'quarter', 'year'], default: 'month', description: 'Timeframe for trend analysis' }
            },
            required: ['categoryId']
          }
        },
        {
          name: 'keepa_sales_velocity',
          description: 'Analyze sales velocity and inventory turnover - find products that sell quickly and avoid slow movers',
          inputSchema: {
            type: 'object',
            properties: {
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              categoryId: { type: 'number', description: 'Amazon category ID to filter by' },
              asin: { type: 'string', description: 'Single ASIN to analyze' },
              asins: { type: 'array', items: { type: 'string' }, maxItems: 50, description: 'Array of ASINs to analyze (max 50)' },
              timeframe: { type: 'string', enum: ['week', 'month', 'quarter'], default: 'month', description: 'Time period for velocity calculation' },
              minVelocity: { type: 'number', minimum: 0, description: 'Minimum daily sales velocity (units/day)' },
              maxVelocity: { type: 'number', minimum: 0, description: 'Maximum daily sales velocity (units/day)' },
              minPrice: { type: 'number', minimum: 0, description: 'Minimum price in cents' },
              maxPrice: { type: 'number', minimum: 0, description: 'Maximum price in cents' },
              minRating: { type: 'number', minimum: 1, maximum: 5, default: 3.0, description: 'Minimum product rating' },
              sortBy: { type: 'string', enum: ['velocity', 'turnoverRate', 'revenueVelocity', 'trend'], default: 'velocity', description: 'Sort results by metric' },
              sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Sort order' },
              page: { type: 'number', minimum: 0, default: 0, description: 'Page number for pagination' },
              perPage: { type: 'number', minimum: 1, maximum: 50, default: 25, description: 'Results per page (max 50)' }
            },
            required: []
          }
        },
        {
          name: 'keepa_inventory_analysis',
          description: 'Comprehensive inventory analysis - identify fast movers, slow movers, stockout risks, and seasonal patterns',
          inputSchema: {
            type: 'object',
            properties: {
              domain: { type: 'number', minimum: 1, maximum: 11, default: 1, description: 'Amazon domain (1=US, 2=UK, 3=DE, etc.)' },
              categoryId: { type: 'number', description: 'Amazon category ID to analyze' },
              asins: { type: 'array', items: { type: 'string' }, maxItems: 100, description: 'Specific ASINs to analyze (your current inventory)' },
              analysisType: { type: 'string', enum: ['overview', 'fast_movers', 'slow_movers', 'stockout_risks', 'seasonal'], default: 'overview', description: 'Type of inventory analysis' },
              timeframe: { type: 'string', enum: ['week', 'month', 'quarter'], default: 'month', description: 'Analysis timeframe' },
              targetTurnoverRate: { type: 'number', minimum: 1, maximum: 50, default: 12, description: 'Target inventory turns per year' }
            },
            required: []
          }
        },
        {
          name: 'keepa_token_status',
          description: 'Check remaining Keepa API tokens and account status',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
      ];

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (!this.keepaClient || !this.keepaTools) {
          this.initializeKeepaClient();
        }

        let result: string;

        switch (name) {
          case 'keepa_product_lookup':
            result = await this.keepaTools!.lookupProduct(
              ProductLookupSchema.parse(args)
            );
            break;

          case 'keepa_batch_product_lookup':
            result = await this.keepaTools!.batchLookupProducts(
              BatchProductLookupSchema.parse(args)
            );
            break;

          case 'keepa_search_deals':
            result = await this.keepaTools!.searchDeals(
              DealSearchSchema.parse(args)
            );
            break;

          case 'keepa_seller_lookup':
            result = await this.keepaTools!.lookupSeller(
              SellerLookupSchema.parse(args)
            );
            break;

          case 'keepa_best_sellers':
            result = await this.keepaTools!.getBestSellers(
              BestSellersSchema.parse(args)
            );
            break;

          case 'keepa_price_history':
            result = await this.keepaTools!.getPriceHistory(
              PriceHistorySchema.parse(args)
            );
            break;

          case 'keepa_product_finder':
            result = await this.keepaTools!.findProducts(
              ProductFinderSchema.parse(args)
            );
            break;

          case 'keepa_category_analysis':
            result = await this.keepaTools!.analyzeCategory(
              CategoryAnalysisSchema.parse(args)
            );
            break;

          case 'keepa_sales_velocity':
            result = await this.keepaTools!.analyzeSalesVelocity(
              SalesVelocitySchema.parse(args)
            );
            break;

          case 'keepa_inventory_analysis':
            result = await this.keepaTools!.analyzeInventory(
              InventoryAnalysisSchema.parse(args)
            );
            break;

          case 'keepa_token_status':
            result = await this.keepaTools!.getTokenStatus(
              TokenStatusSchema.parse(args)
            );
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('Keepa MCP server running on stdio');
    console.error('Make sure to set KEEPA_API_KEY environment variable');
  }
}

const server = new KeepaServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});