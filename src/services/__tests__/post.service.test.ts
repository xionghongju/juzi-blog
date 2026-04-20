
import { supabase } from '@/lib/supabase';
import {
  getPosts,
  getPostBySlug,
  searchPosts,
  incrementViewCount,
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  syncPostTags,
  getPostsByTag,
  getPostsByCategory,
  getRelatedPosts
} from '../post.service';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
  }
}));

describe('Post Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get posts with pagination', async () => {
    const mockResponse = { data: [], error: null };
    supabase.from().select().eq().order().range.mockResolvedValue(mockResponse);

    const result = await getPosts(1);

    expect(supabase.from).toHaveBeenCalledWith('posts');
    expect(supabase.select).toHaveBeenCalledWith('*, category:categories(*), tags:post_tags(tag:tags(*))', { count: 'exact' });
    expect(result).toEqual(mockResponse);
  });

  it('should get posts with category filter', async () => {
    const categoryId = 1;
    const mockResponse = { data: [], error: null };
    supabase.from().select().eq().order().range.mockResolvedValue(mockResponse);

    const result = await getPosts(1, categoryId);

    expect(supabase.eq).toHaveBeenCalledWith('category_id', categoryId);
    expect(result).toEqual(mockResponse);
  });

  it('should get post by slug', async () => {
    const slug = 'test-post';
    const mockResponse = { data: null, error: null };
    supabase.from().select().eq().single.mockResolvedValue(mockResponse);

    const result = await getPostBySlug(slug);

    expect(supabase.eq).toHaveBeenCalledWith('slug', slug);
    expect(result).toEqual(mockResponse);
  });

  it('should search posts by keyword', async () => {
    const keyword = 'test';
    const mockResponse = { data: [], error: null };
    supabase.from().select().eq().textSearch().limit.mockResolvedValue(mockResponse);

    const result = await searchPosts(keyword);

    expect(supabase.textSearch).toHaveBeenCalledWith('title', keyword);
    expect(result).toEqual(mockResponse);
  });

  it('should increment view count', async () => {
    const postId = 1;
    const mockResponse = { data: null, error: null };
    supabase.rpc.mockResolvedValue(mockResponse);

    const result = await incrementViewCount(postId);

    expect(supabase.rpc).toHaveBeenCalledWith('increment_view_count', { post_id: postId });
    expect(result).toEqual(mockResponse);
  });

  it('should get all posts with pagination', async () => {
    const mockResponse = { data: [], error: null };
    supabase.from().select().order().range.mockResolvedValue(mockResponse);

    const result = await getAllPosts(1);

    expect(result).toEqual(mockResponse);
  });

  it('should create a post', async
