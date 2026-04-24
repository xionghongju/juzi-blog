/**
 * @jest-environment node
 */
import { getPostBySlug, incrementViewCount, getRelatedPosts } from '@/services/post.service'
import { notFound } from 'next/navigation'

jest.mock('@/services/post.service', () => ({
  getPostBySlug: jest.fn(),
  incrementViewCount: jest.fn().mockResolvedValue({}),
  getRelatedPosts: jest.fn().mockResolvedValue({ data: [] }),
}))
jest.mock('next/navigation', () => ({
  notFound: jest.fn().mockImplementation(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

import PostDetailPage, { generateMetadata } from '../page'

const mockPost = {
  id: 1,
  slug: 'test-post',
  title: 'Test Post',
  excerpt: 'This is a test excerpt.',
  content: '<p>This is the test content.</p>',
  cover_image: 'http://example.com/image.jpg',
  category: { name: 'Test Category', slug: 'cat', id: 1 },
  published_at: '2023-10-01T00:00:00Z',
  created_at: '2023-10-01T00:00:00Z',
  view_count: 100,
  tags: [{ tag: { id: 1, name: 'tag1' } }],
}

describe('PostDetailPage (server component)', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls getPostBySlug with slug', async () => {
    ;(getPostBySlug as jest.Mock).mockResolvedValue({ data: mockPost })
    await PostDetailPage({ params: Promise.resolve({ slug: 'test-post' }) })
    expect(getPostBySlug).toHaveBeenCalledWith('test-post')
  })

  it('calls notFound when post does not exist', async () => {
    ;(getPostBySlug as jest.Mock).mockResolvedValue({ data: null })
    await expect(PostDetailPage({ params: Promise.resolve({ slug: 'missing' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('generateMetadata returns correct title', async () => {
    ;(getPostBySlug as jest.Mock).mockResolvedValue({ data: mockPost })
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'test-post' }) })
    expect(meta.title).toBe('Test Post')
  })
})
