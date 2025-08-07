import { 
  KeepaDomain, 
  KeepaDataType, 
  getCategoryName, 
  VERIFIED_AMAZON_CATEGORIES 
} from '../src/types';

describe('Types and Enums', () => {
  describe('KeepaDomain', () => {
    it('should have correct domain values', () => {
      expect(KeepaDomain.US).toBe(1);
      expect(KeepaDomain.UK).toBe(2);
      expect(KeepaDomain.DE).toBe(3);
      expect(KeepaDomain.FR).toBe(4);
      expect(KeepaDomain.JP).toBe(5);
      expect(KeepaDomain.CA).toBe(6);
      expect(KeepaDomain.CN).toBe(7);
      expect(KeepaDomain.IT).toBe(8);
      expect(KeepaDomain.ES).toBe(9);
      expect(KeepaDomain.IN).toBe(10);
      expect(KeepaDomain.MX).toBe(11);
    });
  });

  describe('KeepaDataType', () => {
    it('should have COUNT_NEW at correct index', () => {
      // This is critical for our seller count functionality
      expect(KeepaDataType.COUNT_NEW).toBe(11);
    });

    it('should have other important data types', () => {
      expect(KeepaDataType.AMAZON).toBe(0);
      expect(KeepaDataType.NEW).toBe(1);
      expect(KeepaDataType.USED).toBe(2);
      expect(KeepaDataType.SALES_RANK).toBe(3);
      expect(KeepaDataType.RATING).toBe(16);
    });
  });

  describe('VERIFIED_AMAZON_CATEGORIES', () => {
    it('should contain verified categories', () => {
      expect(VERIFIED_AMAZON_CATEGORIES['Electronics']).toBe(172282);
      expect(VERIFIED_AMAZON_CATEGORIES['Books']).toBe(283155);
      expect(VERIFIED_AMAZON_CATEGORIES['Clothing, Shoes & Jewelry']).toBe(7141123011);
    });

    it('should have Industrial & Scientific category used in tests', () => {
      expect(VERIFIED_AMAZON_CATEGORIES['Industrial & Scientific']).toBe(16310091);
    });

    it('should not contain undefined categories', () => {
      expect(Object.values(VERIFIED_AMAZON_CATEGORIES)).not.toContain(undefined);
      expect(Object.values(VERIFIED_AMAZON_CATEGORIES)).not.toContain(null);
    });

    it('should have all category IDs as numbers', () => {
      Object.values(VERIFIED_AMAZON_CATEGORIES).forEach(categoryId => {
        expect(typeof categoryId).toBe('number');
        expect(categoryId).toBeGreaterThan(0);
      });
    });
  });

  describe('getCategoryName', () => {
    it('should return correct category name for valid ID', () => {
      expect(getCategoryName(172282)).toBe('Electronics');
      expect(getCategoryName(283155)).toBe('Books');
      expect(getCategoryName(16310091)).toBe('Industrial & Scientific');
    });

    it('should return undefined for invalid category ID', () => {
      expect(getCategoryName(999999999)).toBeUndefined();
      expect(getCategoryName(-1)).toBeUndefined();
      expect(getCategoryName(0)).toBeUndefined();
    });

    it('should handle edge cases', () => {
      expect(getCategoryName(null as any)).toBeUndefined();
      expect(getCategoryName(undefined as any)).toBeUndefined();
      expect(getCategoryName('string' as any)).toBeUndefined();
    });
  });

  describe('Category Validation', () => {
    it('should have consistent category mappings', () => {
      // Test that forward and reverse lookups are consistent
      Object.entries(VERIFIED_AMAZON_CATEGORIES).forEach(([name, id]) => {
        expect(getCategoryName(id)).toBe(name);
      });
    });

    it('should not have duplicate category IDs', () => {
      const categoryIds = Object.values(VERIFIED_AMAZON_CATEGORIES);
      const uniqueIds = new Set(categoryIds);
      
      expect(uniqueIds.size).toBe(categoryIds.length);
    });

    it('should have reasonable category ID ranges', () => {
      // Amazon category IDs should be positive integers
      Object.values(VERIFIED_AMAZON_CATEGORIES).forEach(categoryId => {
        expect(Number.isInteger(categoryId)).toBe(true);
        expect(categoryId).toBeGreaterThan(0);
        expect(categoryId).toBeLessThan(99999999999); // Reasonable upper bound
      });
    });
  });
});