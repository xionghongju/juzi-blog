
import { supabase } from '@/lib/supabase'
import { getPosts, getPostBySlug, searchPosts, incrementViewCount } from '../post.service'

// Make the chain thenable so it can be awaited at any step
const resolved = { data: [], error: null, count: 0 }
const chain: Record<string, jest.Mock> & { then?: (fn: (v: unknown) => void) => void } = {}
const chainMethods = ['select', 'eq', 'order', 'range', 'single', 'limit', 'textSearch', 'ilike', 'or', 'not', 'gte', 'lte', 'neq', 'in', 'is']
chainMethods.forEach(m => { chain[m] = jest.fn().mockReturnThis() })
// Make chain itself thenable (awaitable) - returns the mock resolved value
;(chain as { then: jest.Mock }).then = jest.fn((resolve: (v: unknown) => void) => resolve(resolved))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}))

describe('Post Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    chainMethods.forEach(m => chain[m].mockReturnThis())
    ;(chain as { then: jest.Mock }).then = jest.fn((resolve: (v: unknown) => void) => resolve(resolved))
    ;(supabase.from as jest.Mock).mockReturnValue(chain)
  })

  it('calls supabase.from("posts") for getPosts', async () => {
    await getPosts(1)
    expect(supabase.from).toHaveBeenCalledWith('posts')
    expect(chain.eq).toHaveBeenCalledWith('status', 'published')
  })

  it('applies categoryId eq filter when provided', async () => {
    await getPosts(1, 5)
    expect(chain.eq).toHaveBeenCalledWith('category_id', 5)
  })

  it('calls getPostBySlug with correct slug', async () => {
    chain.single.mockResolvedValueOnce({ data: null, error: null })
    await getPostBySlug('my-post')
    expect(supabase.from).toHaveBeenCalledWith('posts')
    expect(chain.eq).toHaveBeenCalledWith('slug', 'my-post')
  })

  it('calls rpc for incrementViewCount', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: null, error: null })
    await incrementViewCount(42)
    expect(supabase.rpc).toHaveBeenCalledWith('increment_view_count', { post_id: 42 })
  })

  it('calls from("posts") for searchPosts', async () => {
    await searchPosts('hello')
    expect(supabase.from).toHaveBeenCalledWith('posts')
  })
})
