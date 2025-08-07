import { KeepaClient } from '../src/keepa-client';
import { KeepaDomain } from '../src/types';

describe('KeepaClient', () => {
  let client: KeepaClient;

  beforeEach(() => {
    client = new KeepaClient({ apiKey: 'test-api-key' });
  });

  describe('getSellerCount', () => {
    const mockProduct = {
      stats: {
        current: new Array(34).fill(0),
        avg30: new Array(34).fill(0),
        avg90: new Array(34).fill(0),
        avg180: new Array(34).fill(0),
        avg365: new Array(34).fill(0)
      }
    };

    beforeEach(() => {
      // Set seller count values for testing (DataType.COUNT_NEW = index 11)
      mockProduct.stats.current[11] = 9;    // Current: 9 sellers
      mockProduct.stats.avg30[11] = 7;      // 30-day avg: 7 sellers
      mockProduct.stats.avg90[11] = 5;      // 90-day avg: 5 sellers
      mockProduct.stats.avg180[11] = 4;     // 180-day avg: 4 sellers
      mockProduct.stats.avg365[11] = 3;     // 365-day avg: 3 sellers
    });

    it('should return current seller count', () => {
      const result = client.getSellerCount(mockProduct, 'current');
      
      expect(result.count).toBe(9);
      expect(result.description).toBe('current');
    });

    it('should return 30-day average seller count', () => {
      const result = client.getSellerCount(mockProduct, '30day');
      
      expect(result.count).toBe(7);
      expect(result.description).toBe('30-day average');
    });

    it('should return 90-day average seller count (default)', () => {
      const result = client.getSellerCount(mockProduct, '90day');
      
      expect(result.count).toBe(5);
      expect(result.description).toBe('90-day average');
    });

    it('should return 180-day average seller count', () => {
      const result = client.getSellerCount(mockProduct, '180day');
      
      expect(result.count).toBe(4);
      expect(result.description).toBe('180-day average');
    });

    it('should return 365-day average seller count', () => {
      const result = client.getSellerCount(mockProduct, '365day');
      
      expect(result.count).toBe(3);
      expect(result.description).toBe('365-day average');
    });

    it('should default to 90-day average when no timeframe specified', () => {
      const result = client.getSellerCount(mockProduct);
      
      expect(result.count).toBe(5);
      expect(result.description).toBe('90-day average');
    });

    it('should default to 90-day average for invalid timeframe', () => {
      const result = client.getSellerCount(mockProduct, 'invalid' as any);
      
      expect(result.count).toBe(5);
      expect(result.description).toBe('90-day average (default)');
    });

    it('should return count 1 when product has no stats', () => {
      const productWithoutStats = { asin: 'B123456789' };
      const result = client.getSellerCount(productWithoutStats);
      
      expect(result.count).toBe(1);
      expect(result.description).toBe('90-day average (no stats available)');
    });

    it('should return count 1 when stats array is undefined', () => {
      const productWithUndefinedStats = {
        stats: {
          // avg90 is undefined
        }
      };
      const result = client.getSellerCount(productWithUndefinedStats, '90day');
      
      expect(result.count).toBe(1);
      expect(result.description).toBe('90-day average');
    });

    it('should handle zero seller count correctly', () => {
      // Test that 0 is not treated as falsy
      mockProduct.stats.current[11] = 0;
      const result = client.getSellerCount(mockProduct, 'current');
      
      expect(result.count).toBe(0);
      expect(result.description).toBe('current');
    });
  });

  describe('formatPrice', () => {
    it('should format US prices correctly', () => {
      const price = client.formatPrice(4999, KeepaDomain.US);
      expect(price).toBe('$49.99');
    });

    it('should format UK prices correctly', () => {
      const price = client.formatPrice(2549, KeepaDomain.UK);
      expect(price).toBe('£25.49');
    });

    it('should format zero price correctly', () => {
      const price = client.formatPrice(0, KeepaDomain.US);
      expect(price).toBe('$0.00');
    });
  });

  describe('getDomainName', () => {
    it('should return correct domain names', () => {
      expect(client.getDomainName(KeepaDomain.US)).toBe('amazon.com');
      expect(client.getDomainName(KeepaDomain.UK)).toBe('amazon.co.uk');
      expect(client.getDomainName(KeepaDomain.DE)).toBe('amazon.de');
    });

    it('should default to amazon.com for invalid domain', () => {
      expect(client.getDomainName(999 as any)).toBe('amazon.com');
    });
  });
});