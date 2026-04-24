/**
 * @jest-environment node
 */
import * as postService from '@/services/post.service'

jest.mock('@/services/post.service', () => ({
  getPosts: jest.fn(),
  searchPosts: jest.fn(),
}))
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}))
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

import PostsPage from '../page'

describe('PostsPage (server component)', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls getPosts when no keyword', async () => {
    ;(postService.getPosts as jest.Mock).mockResolvedValue({ data: [], count: 0, error: null })
    await PostsPage({ searchParams: Promise.resolve({ page: '1' }) })
    expect(postService.getPosts).toHaveBeenCalled()
  })

  it('calls searchPosts when keyword is provided', async () => {
    ;(postService.searchPosts as jest.Mock).mockResolvedValue([])
    await PostsPage({ searchParams: Promise.resolve({ q: 'react' }) })
    expect(postService.searchPosts).toHaveBeenCalledWith('react')
  })
})
