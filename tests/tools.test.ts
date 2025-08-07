import { 
  ProductFinderSchema, 
  CategoryAnalysisSchema, 
  SalesVelocitySchema,
  InventoryAnalysisSchema 
} from '../src/tools';

describe('Tool Schemas', () => {
  describe('ProductFinderSchema', () => {
    it('should validate with default sellerCountTimeframe', () => {
      const validInput = {
        domain: 1,
        categoryId: 493964,
        minRating: 4.0,
        minSellerCount: 4,
        maxSellerCount: 8
      };

      const result = ProductFinderSchema.parse(validInput);
      
      expect(result.sellerCountTimeframe).toBe('90day'); // Default value
      expect(result.domain).toBe(1);
      expect(result.categoryId).toBe(493964);
    });

    it('should accept all valid sellerCountTimeframe values', () => {
      const timeframes = ['current', '30day', '90day', '180day', '365day'] as const;
      
      timeframes.forEach(timeframe => {
        const input = {
          domain: 1,
          sellerCountTimeframe: timeframe
        };
        
        const result = ProductFinderSchema.parse(input);
        expect(result.sellerCountTimeframe).toBe(timeframe);
      });
    });

    it('should reject invalid sellerCountTimeframe values', () => {
      const invalidInput = {
        domain: 1,
        sellerCountTimeframe: 'invalid'
      };

      expect(() => ProductFinderSchema.parse(invalidInput)).toThrow();
    });

    it('should validate complete ProductFinder input', () => {
      const completeInput = {
        domain: 1,
        categoryId: 493964,
        minRating: 4.4,
        maxRating: 5.0,
        minPrice: 1000,
        maxPrice: 5000,
        minSellerCount: 4,
        maxSellerCount: 8,
        sellerCountTimeframe: 'current' as const,
        minMonthlySales: 1000,
        isPrime: true,
        hasReviews: true,
        sortBy: 'monthlySold' as const,
        sortOrder: 'desc' as const,
        perPage: 10
      };

      const result = ProductFinderSchema.parse(completeInput);
      
      expect(result).toMatchObject(completeInput);
      expect(result.sellerCountTimeframe).toBe('current');
    });
  });

  describe('CategoryAnalysisSchema', () => {
    it('should validate with default sellerCountTimeframe', () => {
      const validInput = {
        domain: 1,
        categoryId: 493964,
        analysisType: 'overview' as const
      };

      const result = CategoryAnalysisSchema.parse(validInput);
      
      expect(result.sellerCountTimeframe).toBe('90day');
      expect(result.analysisType).toBe('overview');
    });

    it('should accept custom sellerCountTimeframe', () => {
      const input = {
        domain: 1,
        categoryId: 493964,
        analysisType: 'opportunities' as const,
        sellerCountTimeframe: '30day' as const
      };

      const result = CategoryAnalysisSchema.parse(input);
      expect(result.sellerCountTimeframe).toBe('30day');
    });
  });

  describe('SalesVelocitySchema', () => {
    it('should validate with default sellerCountTimeframe', () => {
      const validInput = {
        domain: 1,
        asins: ['B08412MCNW', 'B0DCV47JXX']
      };

      const result = SalesVelocitySchema.parse(validInput);
      
      expect(result.sellerCountTimeframe).toBe('90day');
      expect(result.asins).toEqual(['B08412MCNW', 'B0DCV47JXX']);
    });

    it('should accept custom sellerCountTimeframe', () => {
      const input = {
        domain: 1,
        categoryId: 493964,
        sellerCountTimeframe: '365day' as const,
        minVelocity: 10
      };

      const result = SalesVelocitySchema.parse(input);
      expect(result.sellerCountTimeframe).toBe('365day');
    });
  });

  describe('InventoryAnalysisSchema', () => {
    it('should validate with default sellerCountTimeframe', () => {
      const validInput = {
        domain: 1,
        asins: ['B08412MCNW'],
        analysisType: 'overview' as const
      };

      const result = InventoryAnalysisSchema.parse(validInput);
      
      expect(result.sellerCountTimeframe).toBe('90day');
      expect(result.targetTurnoverRate).toBe(12); // Default
    });

    it('should accept custom parameters', () => {
      const input = {
        domain: 1,
        categoryId: 493964,
        analysisType: 'fast_movers' as const,
        sellerCountTimeframe: '180day' as const,
        targetTurnoverRate: 24,
        timeframe: 'quarter' as const
      };

      const result = InventoryAnalysisSchema.parse(input);
      
      expect(result.sellerCountTimeframe).toBe('180day');
      expect(result.targetTurnoverRate).toBe(24);
      expect(result.timeframe).toBe('quarter');
    });
  });

  describe('Schema Integration', () => {
    it('should ensure all schemas have consistent sellerCountTimeframe options', () => {
      const expectedOptions = ['current', '30day', '90day', '180day', '365day'];
      
      // Test that all schemas accept the same timeframe options
      expectedOptions.forEach(timeframe => {
        expect(() => ProductFinderSchema.parse({ 
          domain: 1, 
          sellerCountTimeframe: timeframe 
        })).not.toThrow();
        
        expect(() => CategoryAnalysisSchema.parse({ 
          domain: 1, 
          categoryId: 123, 
          sellerCountTimeframe: timeframe 
        })).not.toThrow();
        
        expect(() => SalesVelocitySchema.parse({ 
          domain: 1, 
          sellerCountTimeframe: timeframe 
        })).not.toThrow();
        
        expect(() => InventoryAnalysisSchema.parse({ 
          domain: 1, 
          sellerCountTimeframe: timeframe 
        })).not.toThrow();
      });
    });

    it('should reject invalid timeframes consistently across all schemas', () => {
      const invalidTimeframe = 'weekly';
      
      expect(() => ProductFinderSchema.parse({ 
        domain: 1, 
        sellerCountTimeframe: invalidTimeframe 
      })).toThrow();
      
      expect(() => CategoryAnalysisSchema.parse({ 
        domain: 1, 
        categoryId: 123, 
        sellerCountTimeframe: invalidTimeframe 
      })).toThrow();
      
      expect(() => SalesVelocitySchema.parse({ 
        domain: 1, 
        sellerCountTimeframe: invalidTimeframe 
      })).toThrow();
      
      expect(() => InventoryAnalysisSchema.parse({ 
        domain: 1, 
        sellerCountTimeframe: invalidTimeframe 
      })).toThrow();
    });
  });
});