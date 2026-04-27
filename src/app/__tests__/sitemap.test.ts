
import sitemap, { revalidate } from '../sitemap';
import { supabase } from '@/lib/supabase';
import { SITE_CONFIG } from '@/lib/constants';

jest.mock('@/lib/supabase');

describe('sitemap', () => {
  const base = SITE_CONFIG.url;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return static routes when no posts are found', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null })
    });

    const result = await sitemap();

    expect(result).toEqual([
      { url: base, lastModified: expect.any(Date), changeFrequency: 'daily', priority: 1 },
      { url: `${base}/posts`, lastModified: expect.any(Date), changeFrequency: 'daily', priority: 0.9 },
      { url: `${base}/moments`, lastModified: expect.any(Date), changeFrequency: 'weekly', priority: 0.6 },
      { url: `${base}/about`, lastModified: expect.any(Date), changeFrequency: 'monthly', priority: 0.5 }
    ]);
  });

  it('should return static routes along with post routes when posts are found', async () => {
    const mockPosts = [
      { slug: 'first-post', updated_at: new Date('2023-01-01') },
      { slug: 'second-post', updated_at: new Date('2023-01-02') }
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockPosts })
    });

    const result = await sitemap();

    expect(result).toEqual([
      { url: base, lastModified: expect.any(Date), changeFrequency: 'daily', priority: 1 },
      { url: `${base}/posts`, lastModified: expect.any(Date), changeFrequency: 'daily', priority: 0.9 },
      { url: `${base}/moments`, lastModified: expect.any(Date), changeFrequency: 'weekly', priority: 0.6 },
      { url: `${base}/about`, lastModified: expect.any(Date), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${base}/posts/first-post`, lastModified: expect.any(Date), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${base}/posts/second-post`, lastModified: expect.any(Date), changeFrequency: 'weekly', priority: 0.8 }
    ]);
  });

  it('should return static routes when an error occurs', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockRejectedValue(new Error('Database error'))
    });

    const result = await sitemap();

    expect(result).toEqual([
      { url: base, lastModified: expect.any(Date), changeFrequency: 'daily', priority: 1 },
      { url: `${base}/posts`, lastModified: expect.any(Date), changeFrequency: 'daily', priority: 0.9 },
      { url: `${base}/moments`, lastModified: expect.any(Date), changeFrequency: 'weekly', priority: 0.6 },
      { url: `${base}/about`, lastModified: expect.any(Date), changeFrequency: 'monthly', priority: 0.5 }
    ]);
  });

  it('should have the correct revalidate duration', () => {
    expect(re
