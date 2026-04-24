/**
 * @jest-environment node
 */
import { GET } from '../route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn().mockReturnValue(true),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}))

const { checkRateLimit } = require('@/lib/rate-limit')

describe('Unsplash API route', () => {
  const mockFetch = jest.fn()
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest
    global.fetch = mockFetch
  })

  test('returns 429 when rate limit exceeded', async () => {
    checkRateLimit.mockReturnValue(false)
    const res = await GET(mockRequest)
    expect(res.status).toBe(429)
  })

  test('returns 400 when no query provided', async () => {
    checkRateLimit.mockReturnValue(true)
    const res = await GET(mockRequest)
    expect(res.status).toBe(400)
  })

  test('returns 500 when UNSPLASH_ACCESS_KEY not set', async () => {
    checkRateLimit.mockReturnValue(true)
    mockRequest.nextUrl.searchParams.set('query', 'test')
    const saved = process.env.UNSPLASH_ACCESS_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    const res = await GET(mockRequest)
    expect(res.status).toBe(500)
    process.env.UNSPLASH_ACCESS_KEY = saved
  })

  test('returns 502 on network error', async () => {
    checkRateLimit.mockReturnValue(true)
    mockRequest.nextUrl.searchParams.set('query', 'test')
    process.env.UNSPLASH_ACCESS_KEY = 'fake_key'
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const res = await GET(mockRequest)
    expect(res.status).toBe(502)
  })

  test('returns 401 when Unsplash key is invalid', async () => {
    checkRateLimit.mockReturnValue(true)
    mockRequest.nextUrl.searchParams.set('query', 'test')
    process.env.UNSPLASH_ACCESS_KEY = 'fake_key'
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 })
    const res = await GET(mockRequest)
    expect(res.status).toBe(401)
  })

  test('returns results from Unsplash on success', async () => {
    checkRateLimit.mockReturnValue(true)
    mockRequest.nextUrl.searchParams.set('query', 'nature')
    process.env.UNSPLASH_ACCESS_KEY = 'fake_key'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{
          id: '1',
          urls: { small: 'small_url', regular: 'regular_url' },
          alt_description: 'a photo',
          user: { name: 'author', links: { html: 'author_url' } },
          links: { html: 'photo_url' },
        }],
      }),
    })
    const res = await GET(mockRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results).toHaveLength(1)
    expect(body.results[0].id).toBe('1')
  })

  test('returns empty results on 410 Gone', async () => {
    checkRateLimit.mockReturnValue(true)
    mockRequest.nextUrl.searchParams.set('query', 'test')
    process.env.UNSPLASH_ACCESS_KEY = 'fake_key'
    mockFetch.mockResolvedValueOnce({ ok: false, status: 410 })
    const res = await GET(mockRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results).toEqual([])
  })
})
