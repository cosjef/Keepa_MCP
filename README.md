# Keepa MCP Server

A comprehensive Model Context Protocol (MCP) server that provides Claude with advanced Amazon marketplace intelligence through the Keepa API. Access over 3 billion Amazon products with deep analytics for product research, sales velocity, inventory management, and competitive analysis.

## Core Features

### 🔍 **Product Intelligence**
- **Product Research**: Detailed product information by ASIN with pricing, ratings, and availability
- **Batch Processing**: Look up multiple products efficiently (up to 100 ASINs)
- **Advanced Product Finder**: Filter products by rating, price, sales volume, and competition level
- **Price History**: Retrieve historical pricing data with multiple data types

### 💰 **Deal & Market Discovery**
- **Deal Discovery**: Find current Amazon deals with advanced filtering
- **Category Analysis**: Comprehensive market insights, top performers, and opportunities
- **Best Sellers**: Access best seller lists and category rankings
- **Market Trends**: Sales, price, and competition trend analysis

### 📊 **Sales Velocity & Inventory Management**
- **Sales Velocity Analysis**: Find fast-moving products that turn quickly
- **Inventory Turnover**: Avoid slow movers and optimize cash flow
- **Stockout Risk Management**: Get reorder alerts and quantity recommendations
- **Seasonal Patterns**: Understand quarterly demand fluctuations

### 🏪 **Seller Intelligence**
- **Seller Analytics**: Get comprehensive seller information and ratings
- **Competition Analysis**: Evaluate market saturation and opportunity scores
- **Multi-Domain Support**: Works across all Amazon marketplaces (US, UK, DE, FR, JP, CA, etc.)

## 🛠️ Available Tools

**10 Powerful MCP Tools:**

### Core Product Research
1. **`keepa_product_lookup`** - Single product details with pricing and ratings
2. **`keepa_batch_product_lookup`** - Multiple products analysis (up to 100 ASINs)
3. **`keepa_price_history`** - Historical price data and trends

### Market Discovery & Analysis  
4. **`keepa_search_deals`** - Current deals with advanced filtering
5. **`keepa_product_finder`** - Advanced product finder with competition analysis
6. **`keepa_category_analysis`** - Comprehensive category insights and opportunities
7. **`keepa_best_sellers`** - Category best sellers and rankings

### Sales Velocity & Inventory Management
8. **`keepa_sales_velocity`** - Sales velocity and turnover analysis
9. **`keepa_inventory_analysis`** - Inventory optimization and risk management

### Seller Intelligence
10. **`keepa_seller_lookup`** - Detailed seller information and analytics

## Prerequisites

1. **Keepa API Key**: Sign up at [https://keepa.com/#!api](https://keepa.com/#!api)
   - Keepa requires a paid subscription with token-based pricing
   - Different endpoints have different token costs
   - Product history calls are more expensive than basic product info

2. **Node.js**: Version 18 or higher

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

4. Set up your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your Keepa API key
   ```

## Configuration

### Environment Variables

- `KEEPA_API_KEY` (required): Your Keepa API key
- `KEEPA_RATE_LIMIT_DELAY` (optional): Delay between requests in milliseconds (default: 1000)
- `KEEPA_TIMEOUT` (optional): Request timeout in milliseconds (default: 30000)

### Claude Desktop Configuration

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "keepa": {
      "command": "node",
      "args": ["/path/to/keepa_mcp/dist/index.js"],
      "env": {
        "KEEPA_API_KEY": "your_keepa_api_key_here"
      }
    }
  }
}
```

## Available Tools

### 1. Product Lookup (`keepa_product_lookup`)
Get detailed information for a single Amazon product.

**Parameters:**
- `asin` (string): Amazon ASIN (product identifier)
- `domain` (number, optional): Amazon domain (1=US, 2=UK, 3=DE, etc.) - default: 1
- `days` (number, optional): Days of price history to include (1-365)
- `history` (boolean, optional): Include full price history - default: false
- `offers` (number, optional): Number of marketplace offers to include (0-100)
- `variations` (boolean, optional): Include product variations - default: false
- `rating` (boolean, optional): Include product rating data - default: false

### 2. Batch Product Lookup (`keepa_batch_product_lookup`)
Look up multiple products efficiently.

**Parameters:**
- `asins` (array): Array of Amazon ASINs (max 100)
- `domain` (number, optional): Amazon domain - default: 1
- `days` (number, optional): Days of price history to include
- `history` (boolean, optional): Include full price history - default: false

### 3. Deal Search (`keepa_search_deals`)
Find current Amazon deals with filtering options.

**Parameters:**
- `domain` (number, optional): Amazon domain - default: 1
- `categoryId` (number, optional): Amazon category ID to filter by
- `minPrice` (number, optional): Minimum price in cents
- `maxPrice` (number, optional): Maximum price in cents
- `minDiscount` (number, optional): Minimum discount percentage (0-100)
- `minRating` (number, optional): Minimum product rating (1-5 stars)
- `isPrime` (boolean, optional): Filter for Prime eligible deals only
- `sortType` (number, optional): Sort type (0=deal score, 1=price, 2=discount, 3=rating, 4=reviews) - default: 0
- `page` (number, optional): Page number for pagination - default: 0
- `perPage` (number, optional): Results per page (max 50) - default: 25

### 4. Seller Lookup (`keepa_seller_lookup`)
Get detailed information about an Amazon seller.

**Parameters:**
- `seller` (string): Seller ID or name
- `domain` (number, optional): Amazon domain - default: 1
- `storefront` (number, optional): Number of storefront ASINs to retrieve (0-100000)

### 5. Best Sellers (`keepa_best_sellers`)
Get best sellers list for a specific Amazon category.

**Parameters:**
- `domain` (number, optional): Amazon domain - default: 1
- `category` (number): Amazon category ID
- `page` (number, optional): Page number for pagination - default: 0

### 6. Price History (`keepa_price_history`)
Get historical price data for an Amazon product.

**Parameters:**
- `asin` (string): Amazon ASIN (product identifier)
- `domain` (number, optional): Amazon domain - default: 1
- `dataType` (number): Data type (0=Amazon, 1=New, 2=Used, 3=Sales Rank, etc.)
- `days` (number, optional): Number of days of history (1-365) - default: 30

### 7. Product Finder (`keepa_product_finder`)
Advanced product finder with filtering similar to Keepa's Product Finder - find high-opportunity products by rating, price, sales volume, and competition level.

**Parameters:**
- `domain` (number, optional): Amazon domain - default: 1
- `categoryId` (number, optional): Amazon category ID to search within
- `minRating` (number, optional): Minimum product rating (1-5 stars)
- `maxRating` (number, optional): Maximum product rating (1-5 stars)
- `minPrice` (number, optional): Minimum price in cents
- `maxPrice` (number, optional): Maximum price in cents
- `minShipping` (number, optional): Minimum shipping cost in cents
- `maxShipping` (number, optional): Maximum shipping cost in cents
- `minMonthlySales` (number, optional): Minimum estimated monthly sales
- `maxMonthlySales` (number, optional): Maximum estimated monthly sales
- `minSellerCount` (number, optional): Minimum number of sellers (lower = less competition)
- `maxSellerCount` (number, optional): Maximum number of sellers (higher = more competition)
- `isPrime` (boolean, optional): Filter for Prime eligible products only
- `hasReviews` (boolean, optional): Filter for products with reviews only
- `productType` (number, optional): Product type (0=standard, 1=variation parent, 2=variation child) - default: 0
- `sortBy` (string, optional): Sort by field ('monthlySold', 'price', 'rating', 'reviewCount', 'salesRank') - default: 'monthlySold'
- `sortOrder` (string, optional): Sort order ('asc', 'desc') - default: 'desc'
- `page` (number, optional): Page number for pagination - default: 0
- `perPage` (number, optional): Results per page (max 50) - default: 25

### 8. Category Analysis (`keepa_category_analysis`)
Comprehensive category analysis to find the best products, market opportunities, and competitive insights.

**Parameters:**
- `domain` (number, optional): Amazon domain - default: 1
- `categoryId` (number): Amazon category ID to analyze
- `analysisType` (string, optional): Type of analysis ('overview', 'top_performers', 'opportunities', 'trends') - default: 'overview'
- `priceRange` (string, optional): Focus on price range ('budget', 'mid', 'premium', 'luxury')
- `minRating` (number, optional): Minimum rating for products - default: 3.0
- `includeSubcategories` (boolean, optional): Include subcategory analysis - default: false
- `timeframe` (string, optional): Analysis timeframe ('week', 'month', 'quarter', 'year') - default: 'month'

### 9. Sales Velocity Analysis (`keepa_sales_velocity`)
Find fast-moving products that turn quickly and avoid slow-moving inventory that ties up cash flow.

**Parameters:**
- `domain` (number, optional): Amazon domain - default: 1
- `categoryId` (number, optional): Amazon category ID to filter by
- `asin` (string, optional): Single ASIN to analyze
- `asins` (array, optional): Array of ASINs to analyze (max 50)
- `timeframe` (string, optional): Time period ('week', 'month', 'quarter') - default: 'month'
- `minVelocity` (number, optional): Minimum daily sales velocity (units/day)
- `maxVelocity` (number, optional): Maximum daily sales velocity (units/day)
- `minPrice` (number, optional): Minimum price in cents
- `maxPrice` (number, optional): Maximum price in cents
- `minRating` (number, optional): Minimum product rating - default: 3.0
- `sortBy` (string, optional): Sort by ('velocity', 'turnoverRate', 'revenueVelocity', 'trend') - default: 'velocity'
- `sortOrder` (string, optional): Sort order ('asc', 'desc') - default: 'desc'

### 10. Inventory Analysis (`keepa_inventory_analysis`) 
Comprehensive inventory management analysis to optimize turnover and identify risks.

**Parameters:**
- `domain` (number, optional): Amazon domain - default: 1
- `categoryId` (number, optional): Amazon category ID to analyze
- `asins` (array, optional): Specific ASINs to analyze (your current inventory, max 100)
- `analysisType` (string, optional): Analysis type ('overview', 'fast_movers', 'slow_movers', 'stockout_risks', 'seasonal') - default: 'overview'
- `timeframe` (string, optional): Analysis timeframe ('week', 'month', 'quarter') - default: 'month'
- `targetTurnoverRate` (number, optional): Target inventory turns per year - default: 12

## Amazon Domain IDs

- 1: United States (amazon.com)
- 2: United Kingdom (amazon.co.uk)
- 3: Germany (amazon.de)
- 4: France (amazon.fr)
- 5: Japan (amazon.co.jp)
- 6: Canada (amazon.ca)
- 7: China (amazon.cn)
- 8: Italy (amazon.it)
- 9: Spain (amazon.es)
- 10: India (amazon.in)
- 11: Mexico (amazon.com.mx)

## Data Types for Price History

- 0: Amazon Price
- 1: New Price (3rd party)
- 2: Used Price
- 3: Sales Rank
- 16: Rating
- 17: Review Count
- 18: Buy Box Price

[See full list in types.ts](src/types.ts)

## Usage Examples

### Basic Product Lookup
```typescript
// Look up a product with basic info
{
  "asin": "B08N5WRWNW",
  "domain": 1
}
```

### Product with Price History
```typescript
// Get product with 30 days of price history
{
  "asin": "B08N5WRWNW",
  "domain": 1,
  "days": 30,
  "history": true,
  "rating": true
}
```

### Deal Search
```typescript
// Find deals in Electronics category with minimum 20% discount
{
  "domain": 1,
  "categoryId": 493964,
  "minDiscount": 20,
  "isPrime": true,
  "sortType": 0,
  "perPage": 20
}
```

### Seller Analysis
```typescript
// Get detailed seller information
{
  "seller": "A2L77EE7U53NWQ",
  "domain": 1,
  "storefront": 100
}
```

### Product Finder - High Opportunity Products
```typescript
// Find products like the Keepa URL example: high rating, specific shipping range, good sales, low competition
{
  "domain": 1,
  "categoryId": 16310091,
  "minRating": 4.4,
  "maxRating": 5.0,
  "minShipping": 1000,
  "maxShipping": 2500,
  "minMonthlySales": 2000,
  "maxSellerCount": 5,
  "sortBy": "monthlySold",
  "sortOrder": "desc",
  "perPage": 20
}
```

### Category Analysis - Market Intelligence
```typescript
// Get category overview with top performers and opportunities
{
  "categoryId": 16310091,
  "analysisType": "overview"
}

// Find top performing products in a category
{
  "categoryId": 16310091,
  "analysisType": "top_performers",
  "minRating": 4.0
}

// Identify market opportunities and gaps
{
  "categoryId": 16310091,
  "analysisType": "opportunities",
  "priceRange": "mid"
}
```

### Sales Velocity - Fast Moving Products
```typescript
// Find products that sell quickly (great for cash flow)
{
  "minVelocity": 15,
  "maxVelocity": 100,
  "sortBy": "velocity",
  "sortOrder": "desc",
  "categoryId": 16310091
}

// Analyze specific products for velocity
{
  "asins": ["B08N5WRWNW", "B08C1W5N87", "B07YTK3YQD"],
  "timeframe": "month",
  "sortBy": "turnoverRate"
}

// Find high revenue velocity products
{
  "minVelocity": 20,
  "minPrice": 2000,
  "sortBy": "revenueVelocity",
  "sortOrder": "desc"
}
```

### Inventory Analysis - Portfolio Management  
```typescript
// Overall inventory health check
{
  "analysisType": "overview",
  "targetTurnoverRate": 12
}

// Identify fast movers (>30 units/month)
{
  "analysisType": "fast_movers",
  "categoryId": 16310091
}

// Find slow movers that need attention
{
  "analysisType": "slow_movers",
  "timeframe": "quarter"
}

// Check for stockout risks
{
  "analysisType": "stockout_risks",
  "asins": ["B08N5WRWNW", "B08C1W5N87"]
}

// Analyze seasonal patterns
{
  "analysisType": "seasonal",
  "categoryId": 16310091
}
```

## Development

### Scripts
- `npm run build`: Build TypeScript to JavaScript
- `npm run dev`: Run in development mode with auto-reload
- `npm start`: Start the built server
- `npm run lint`: Run ESLint
- `npm run type-check`: Check TypeScript types

### Testing
```bash
npm test
```

## Important Considerations

### Rate Limiting
- The server implements automatic rate limiting between requests
- Default delay is 1000ms between requests (configurable)
- Keepa has token-based rate limiting on their end

### Token Costs
- Each API call consumes tokens from your Keepa account
- Product history calls are more expensive than basic product info
- Monitor your token usage in the Keepa dashboard

### Error Handling
- Network errors are automatically retried
- API errors include token information when available
- All errors are gracefully handled and reported

## Support

For issues related to:
- **This MCP Server**: Create an issue in this repository
- **Keepa API**: Contact Keepa support at [https://keepa.com/#!api](https://keepa.com/#!api)
- **MCP Protocol**: See [MCP documentation](https://modelcontextprotocol.io/)

## License

MIT License - see LICENSE file for details.