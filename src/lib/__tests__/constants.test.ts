
import { POST_STATUS, COMMENT_STATUS, PAGE_SIZE, SITE_CONFIG, MOOD_OPTIONS } from '../constants';

describe('constants', () => {
  test('POST_STATUS should have correct values', () => {
    expect(POST_STATUS).toEqual({
      DRAFT: 'draft',
      PUBLISHED: 'published',
    });
  });

  test('COMMENT_STATUS should have correct values', () => {
    expect(COMMENT_STATUS).toEqual({
      PENDING: 'pending',
      APPROVED: 'approved',
      REJECTED: 'rejected',
    });
  });

  test('PAGE_SIZE should be 10', () => {
    expect(PAGE_SIZE).toBe(10);
  });

  test('SITE_CONFIG should have correct structure and values', () => {
    expect(SITE_CONFIG).toEqual({
      name: '橘子的博客',
      description: '记录生活，分享技术',
      url: expect.any(String),
    });
    expect(SITE_CONFIG.url).toBe(
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    );
  });

  test('MOOD_OPTIONS should have correct length and structure', () => {
    expect(MOOD_OPTIONS).toHaveLength(20);
    expect(MOOD_OPTIONS[0]).toEqual({ label: '开心', value: 'happy', emoji: '😊' });
    expect(MOOD_OPTIONS[19]).toEqual({ label: '吃货', value: 'foodie', emoji: '🍜' });
  });
});
