
import { cn, formatDate, formatRelativeTime, slugify, truncate, estimateReadingTime } from '../utils';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2022-01-01T00:00:00Z';
      expect(formatDate(date)).toBe('2022年01月01日');
    });

    it('should throw for invalid date', () => {
      expect(() => formatDate('invalid-date')).toThrow();
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time for recent past', () => {
      const date = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // 1 hour ago
      expect(formatRelativeTime(date)).toBeTruthy();
    });

    it('should throw for invalid date', () => {
      expect(() => formatRelativeTime('invalid-date')).toThrow();
    });
  });

  describe('slugify', () => {
    it('should convert string to slug correctly', () => {
      expect(slugify('Test Slug Function!')).toBe('test-slug-function');
      expect(slugify('  Multiple    Spaces   ')).toBe('multiple-spaces');
      expect(slugify('Special@#%Characters!')).toBe('specialcharacters');
    });
  });

  describe('truncate', () => {
    it('should truncate text correctly', () => {
      expect(truncate('Hello, World!', 5)).toBe('Hello...');
      expect(truncate('Hello, World!', 20)).toBe('Hello, World!');
    });

    it('should handle empty text', () => {
      expect(truncate('', 5)).toBe('');
    });
  });

  describe('estimateReadingTime', () => {
    it('should estimate reading time correctly for Chinese text', () => {
      const html = '你好，世界！';
      expect(estimateReadingTime(html)).toBe(1);
    });

    it('should estimate reading time correctly for English text', () => {
      const html = '<p>This is a simple test.</p>';
      expect(estimateReadingTime(html)).toBe(1);
    });

    it('should estimate reading time correctly for mixed text', () => {
      const html = 'Hello 你好, this is a test!';
      expect(estimateReadingTime(html)).toBe(1);
    });

    it('should return minimum reading time of 1', () => {
      const html = '';
      expect(estimateReadingTime(html)).toBe(1);
    });
  });
});
