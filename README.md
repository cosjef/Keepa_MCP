# Keepa MCP Server

A Model Context Protocol (MCP) server that gives Claude access to Keepa's product and sales data through a more approachable, conversational interface. It simplifies Keepa's complex, engineer-oriented design, making it easier to explore product research, sales trends, inventory signals, and competitive analytics without needing to master Keepa's native UI.

## ✨ **Core Capabilities**

### 📊 **Advanced Sales Velocity & Inventory Optimization** 
- **🚀 Sales Velocity Analysis**: Identify fast-moving products that generate cash flow (20+ units/day)
- **📈 Inventory Turnover Intelligence**: Avoid slow movers that tie up capital (<5 units/month)
- **⚠️ Stockout Risk Management**: Automated reorder alerts and quantity recommendations
- **📅 Seasonal Pattern Recognition**: Q4 holiday, back-to-school, and quarterly demand analytics
- **💰 Cash Flow Optimization**: Target 20-35 day inventory levels for maximum ROI

### 🔍 **Professional Product Research & Discovery**
- **🎯 Advanced Product Finder**: 20+ filters including rating, price, competition, and sales volume
- **⭐ Market Opportunity Scoring**: Find high-opportunity, low-competition products
- **📋 Batch Analysis**: Process up to 100 ASINs simultaneously for portfolio analysis
- **💡 Integrated Analytics**: Statistics Object provides ongoing velocity data included with product lookups
- **🏆 Competition Intelligence**: Seller count analysis and market saturation scoring

### 💎 **Deal Discovery & Profit Analysis**
- **💰 Enhanced Deal Discovery**: Find deals with 20%+ discounts and profit potential scoring
- **⚡ Lightning Deal Monitoring**: Track time-sensitive deals with urgency alerts
- **🎯 Profit Potential Calculator**: Automated profit margin and ROI analysis
- **🌟 Prime-Eligible Filtering**: Focus on high-converting Prime products

### 🏢 **Category & Market Intelligence**
- **📊 Comprehensive Category Analysis**: Market size, competition levels, and brand concentration
- **🎯 Opportunity Scoring**: Algorithmic scoring of market entry opportunities (0-100%)
- **📈 Performance Benchmarking**: Compare against top performers in any category
- **💡 Strategic Recommendations**: AI-generated market entry and optimization strategies

## 🛠️ **Available MCP Tools**

> **💬 Natural Language Interface**: Simply ask Claude questions - no JSON or technical syntax required! Claude automatically uses these tools based on your requests.

### 🔍 **Core Product Intelligence**
1. **`keepa_product_lookup`** - Deep product analysis with included Statistics Object analytics
2. **`keepa_batch_product_lookup`** - Portfolio analysis for up to 100 ASINs simultaneously  
3. **`keepa_price_history`** - Historical pricing trends and market stability analysis

### 🎯 **Advanced Market Discovery**  
4. **`keepa_product_finder`** - **20+ advanced filters** for opportunity discovery
5. **`keepa_category_analysis`** - **Comprehensive market intelligence** with opportunity scoring
6. **`keepa_search_deals`** - **Enhanced deal discovery** with profit potential analysis
7. **`keepa_best_sellers`** - Category rankings and trending product identification

### 📊 **Sales Velocity & Cash Flow Optimization**
8. **`keepa_sales_velocity`** - **Industry-standard velocity calculations** for inventory turnover
9. **`keepa_inventory_analysis`** - **Portfolio management** with stockout risk assessment

### 🏢 **Competitive Intelligence**
10. **`keepa_seller_lookup`** - Seller performance analysis and competitive research

### 🪙 **Token Management**
11. **`keepa_token_status`** - Check remaining API tokens and account status

## Prerequisites

1. **Keepa API Key**: Sign up at [https://keepa.com/#!api](https://keepa.com/#!api)
   - Keepa requires a paid subscription with token-based pricing
   - Different endpoints have different token costs
   - Product history calls are more expensive than basic product info

2. **Node.js**: Version 18 or higher

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd keepa_mcp
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. You'll configure your Keepa API key in the Claude Desktop config (next section)

## Configuration

### Environment Variables

The MCP server accepts these environment variables (configured in Claude Desktop):
- `KEEPA_API_KEY` (required): Your Keepa API key
- `KEEPA_RATE_LIMIT_DELAY` (optional): Delay between requests in milliseconds (default: 1000)
- `KEEPA_TIMEOUT` (optional): Request timeout in milliseconds (default: 30000)

### Claude Desktop Configuration

**Location**: 
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

**Note**: If the file doesn't exist, create it. Some installations may have `config.json` instead - copy it to the correct filename:
```bash
cp ~/Library/Application\ Support/Claude/config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

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

**Replace `/path/to/keepa_mcp` with your actual path and `your_keepa_api_key_here` with your Keepa API key.**

**⚠️ Important**: After making any changes to your `claude_desktop_config.json` file, you must completely close Claude Desktop (Cmd+Q on macOS or Alt+F4 on Windows) and restart it for the changes to take effect.

### **Grant MCP Server Permissions**

When you first start Claude Desktop with the MCP server configured, you'll see a permission dialog. Click **"Allow"** to grant the server access:

![Claude Desktop Permissions](screenshots/claude_permissions.jpg)

*You must grant these permissions for the Keepa tools to appear and function properly.*

## 🔧 Troubleshooting

### **If MCP tools don't appear in Claude Desktop:**

1. **Check Claude Desktop version**: Ensure you're running version 0.7.0 or later (MCP support required)
   - Click "Claude" menu → "About Claude"

2. **Verify config file location and format**:
   ```bash
   # Check if file exists
   ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Validate JSON format
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **Test MCP server manually**:
   ```bash
   cd /path/to/keepa_mcp
   npm run build
   KEEPA_API_KEY=your_key_here node dist/index.js
   ```

4. **Complete restart**: Force quit Claude Desktop (Cmd+Q) and relaunch

5. **Simplified config**: Try removing other settings and use minimal config:
   ```json
   {
     "mcpServers": {
       "keepa": {
         "command": "node",
         "args": ["/full/path/to/keepa_mcp/dist/index.js"],
         "env": {
           "KEEPA_API_KEY": "your_keepa_api_key_here"
         }
       }
     }
   }
   ```

6. **Check for logs**: Look for error messages in Claude Desktop console or system logs

### **Common Issues:**
- **Wrong file path**: Ensure the path to `dist/index.js` is absolute and correct
- **Missing build**: Run `npm run build` after any code changes
- **Invalid JSON**: Use a JSON validator to check config file syntax
- **Missing API key**: Make sure `KEEPA_API_KEY` is set in the env section of your config

### **✅ Verify MCP Server Connection**
Once you've configured everything and restarted Claude Desktop, you should see your Keepa tools available:

![Keepa Tools Available](screenshots/keepa-tools-available.jpg)

*The Keepa MCP server provides 10 powerful tools for Amazon marketplace intelligence, sales velocity analysis, and inventory management.*

If you see these tools in Claude Desktop, your MCP server is successfully connected and ready to use!

## 🚀 **Usage Examples**

> **✅ Verify Setup**: After configuration, ask Claude any of these questions to test your MCP server connection.

### 🎯 **Sales Velocity Optimization**
**Find Cash Flow Champions:**
```
"Use Keepa to find products in Electronics that sell 50+ units daily with high inventory turnover"
```

**Avoid Cash Flow Killers:**
```
"Show me slow-moving products in my category that tie up capital for 60+ days using Keepa"
```

**Portfolio Health Check:**
```
"Analyze my current inventory for stockout risks and cash flow optimization using Keepa ASINs: [your ASINs]"
```

### 💎 **Market Opportunity Discovery**
**Find High-Opportunity Niches:**
```
"Use Keepa to find low-competition products in Home & Kitchen with 4+ star ratings and 1000+ monthly sales"
```

**Category Market Intelligence:**
```
"Analyze the Pet Supplies category for market opportunities, competition levels, and profit potential using Keepa"
```

**Competition Gap Analysis:**
```
"Find products with high sales but fewer than 5 sellers in the Beauty category using Keepa"
```

### 🔥 **Deal Hunting & Profit Analysis**  
**High-Margin Deal Discovery:**
```
"Find current Amazon Lightning Deals with 30%+ discounts and high profit potential using Keepa"
```

**Prime Deal Intelligence:**
```
"Show me Prime-exclusive deals under $100 with 4+ star ratings that could be profitable using Keepa"
```

### 📊 **Advanced Analytics & Forecasting**
**Seasonal Planning:**
```
"Analyze seasonal patterns for Holiday products and recommend inventory levels for Q4 using Keepa"
```

**Performance Benchmarking:**
```
"Compare my product's sales velocity against top performers in its category using Keepa ASIN: [your ASIN]"
```

**Market Trend Analysis:**
```
"Identify trending products in Electronics with accelerating sales velocity using Keepa"
```

### 🪙 **Token Management & Monitoring**
**Check Token Status:**
```
"Check my Keepa token status"
```

**Monitor Usage:**
```
"How many Keepa tokens do I have left?"
```

---

## 🎯 **Example Output**

### **📈 Sales Velocity Analysis Output**
```
✅ Electronics Portfolio Analysis Complete!

📊 Portfolio Overview:
- Total Products: 25
- Average Turnover Rate: 18.5 times/year
- Portfolio Health: Excellent - High velocity, low risk

📈 Performance Metrics:
- Average Velocity: 145.2 units/month
- Total Revenue Velocity: $2,847.33/day
- Average Days Inventory: 22 days

⚠️ Risk Assessment:
- High Risk Products: 2 (8%)
- Fast Movers (≥30/month): 76%
- Slow Movers (<10/month): 8%

💡 Strategic Recommendations:
🚀 Strong portfolio velocity - maintain current strategy
🟡 Monitor 2 products with stockout risks
📈 Focus marketing on accelerating trend products
🎯 Optimal inventory levels for maximum cash flow
```

### **🎯 Market Opportunity Discovery Output**
```
📊 Home & Kitchen Category Analysis:

🏷️ Market Overview:
- Category Size: 2.3M+ products
- Average Price: $34.67
- Competition Level: Medium
- Opportunity Score: 78%

💡 Key Insights:
• Budget-friendly category with high volume potential
• Quality improvement opportunities exist (avg 3.8★)  
• 15% of products have fewer than 5 sellers
• Growing trend toward eco-friendly products

🎯 Top Opportunities:
1. Kitchen gadgets $15-45 price range
2. Storage solutions with premium materials  
3. Smart home integration products
4. Seasonal/holiday-themed items

💰 Profit Potential: HIGH
🏆 Market Entry Difficulty: LOW-MEDIUM
```

### **🪙 Token Status Check Output**
```
🪙 Keepa API Token Status

💰 Tokens Remaining: 247

✅ Status: EXCELLENT - Plenty of tokens available
💡 Recommendation: Use advanced analytics freely

📊 Check detailed usage: https://keepa.com/#!api
⏰ Tokens refresh: According to your Keepa subscription plan
```

*These examples show the level of professional marketplace intelligence you'll receive from the Keepa MCP server.*


## 📂 **Verified Amazon Category IDs**

**✅ 100% VALIDATED**: All 35 category IDs have been tested and verified to work with the Keepa API. Project achieved complete success with full category coverage.

### **Major Categories (US Marketplace)**
- **Electronics**: 172282 ✅
- **Home & Kitchen**: 1055398 ✅  
- **Industrial & Scientific**: 16310091 ✅
- **Automotive**: 15684181 ✅
- **Sports & Outdoors**: 3375251 ✅
- **Tools & Home Improvement**: 228013 ✅
- **Health & Household**: 3760901 ✅
- **Beauty & Personal Care**: 3760911 ✅
- **Clothing, Shoes & Jewelry**: 7141123011 ✅
- **Toys & Games**: 165793011 ✅
- **Pet Supplies**: 2619533011 ✅
- **Office Products**: 1064954 ✅
- **Baby Products**: 165796011 ✅
- **Grocery & Gourmet Food**: 16310101 ✅
- **Arts, Crafts & Sewing**: 2617941011 ✅
- **Musical Instruments**: 11091801 ✅
- **Patio, Lawn & Garden**: 2972638011 ✅
- **Video Games**: 468642 ✅
- **Books**: 283155 ✅
- **Movies & TV**: 2625373011 ✅

### **Digital & Specialized Categories**
- **Appliances**: 2619525011 ✅
- **Apps & Games**: 2350149011 ✅
- **Audible Books & Originals**: 18145289011 ✅
- **CDs & Vinyl**: 5174 ✅
- **Cell Phones & Accessories**: 2335752011 ✅
- **Collectibles & Fine Art**: 4991425011 ✅
- **Credit & Payment Cards**: 3561432011 ✅
- **Digital Music**: 163856011 ✅
- **Everything Else**: 10272111 ✅
- **Gift Cards**: 2238192011 ✅
- **Handmade Products**: 11260432011 ✅
- **Kindle Store**: 133140011 ✅
- **Luxury Stores**: 18981045011 ✅
- **Magazine Subscriptions**: 599858 ✅
- **Prime Video**: 2858778011 ✅
- **Software**: 229534 ✅
- **Video Shorts**: 9013971011 ✅

> **💡 Pro Tip**: The MCP server automatically validates category IDs and suggests alternatives if you use an invalid one.

---

## 🌍 **Multi-Marketplace Support**

**Global Intelligence Across 11 Amazon Marketplaces:**
- 🇺🇸 **United States** (amazon.com) - *Default and most comprehensive*
- 🇬🇧 **United Kingdom** (amazon.co.uk)  
- 🇩🇪 **Germany** (amazon.de)
- 🇫🇷 **France** (amazon.fr)
- 🇯🇵 **Japan** (amazon.co.jp)
- 🇨🇦 **Canada** (amazon.ca)
- 🇮🇹 **Italy** (amazon.it)
- 🇪🇸 **Spain** (amazon.es)
- 🇮🇳 **India** (amazon.in)
- 🇲🇽 **Mexico** (amazon.com.mx)
- 🇨🇳 **China** (amazon.cn)

> **💬 Simple Usage**: Just mention the country: *"Find deals in German Amazon using Keepa"*

---

## 💰 **Token Usage & Cost Information**

The Keepa API operates on a token-based system where each API query consumes tokens from your account. Different endpoints consume different amounts of tokens, and your usage is tracked across all requests.

### **📊 Token Usage Guidelines**
- **Product Lookup**: ~1 token (includes Statistics Object data at no additional cost)
- **Market Analysis**: ~5-15 tokens (depending on category size)
- **Deal Discovery**: ~3-8 tokens (varies by filters)
- **Velocity Analysis**: ~2-5 tokens (includes portfolio metrics)

### **💡 Cost Optimization Features**
- **Statistics Object Integration**: Sales velocity and inventory analytics included with product lookups (no additional tokens required)
- **Smart Batching**: Process up to 100 ASINs in single requests to minimize token usage
- **Efficient Caching**: Built-in rate limiting and request optimization

### **⚠️ IMPORTANT: Token Exhaustion Behavior**
**Critical Limitation**: When your Keepa API tokens are exhausted (≤0), the MCP server will fail and return "No products found" messages instead of meaningful data.

**What Happens:**
- ❌ **Searches return empty results** (not actual empty categories)
- ❌ **No error indicating token exhaustion** (appears as failed searches)
- ❌ **All tools appear broken** until tokens refresh

**How to Identify:**
- Use the dedicated token status tool: Ask Claude *"Check my Keepa token status"*
- Multiple categories returning "No products found" 
- Recently working searches suddenly failing
- Low token warnings in search results

**Solutions:**
- **Wait for token refresh** (daily or monthly depending on your Keepa plan)
- **Upgrade your Keepa plan** for more tokens
- **Check your usage** at [Keepa API Dashboard](https://keepa.com/#!api)

**Low Token Warning**: The server warns when you have <5 tokens remaining.


## 🔧 **Developer Reference**

> **👥 For Regular Users**: Skip this section - just ask Claude questions in natural language!
> **🛠️ For Developers**: Technical details for integration and customization.

### **🛠️ Development Scripts**
```bash
npm run build     # Build TypeScript to JavaScript  
npm run dev       # Development mode with auto-reload
npm start         # Start the built server
npm run lint      # Run ESLint
npm run type-check # Check TypeScript types
```

### **📚 Technical Documentation**
- **API Types**: See [types.ts](src/types.ts) for complete TypeScript definitions
- **MCP Tools**: See [tools.ts](src/tools.ts) for all 10 tool implementations with Zod validation
- **Analytics Engine**: See [keepa-client.ts](src/keepa-client.ts) for advanced algorithms

---

## 🚀 **Get Started in 3 Steps**

### **1. Get Your Keepa API Key**
Sign up at [https://keepa.com/#!api](https://keepa.com/#!api)

### **2. Configure Claude Desktop**
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
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

### **3. Ask Claude Smart Questions**
```
"Use Keepa to find fast-moving products in Electronics with high profit potential"
```

---

## 📞 **Support & Resources**

- **🛠️ MCP Server Issues**: [Create Issue on GitHub](https://github.com/your-repo/keepa-mcp-server)
- **📚 Keepa API Questions**: [Keepa Support](https://keepa.com/#!api)  
- **🔗 MCP Protocol**: [Official MCP Documentation](https://modelcontextprotocol.io/)

---

## 📄 **License**

MIT License - See [LICENSE](LICENSE) file for details.

---

**🚀 Ready to transform your Amazon marketplace intelligence? Get started today!**