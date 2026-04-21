
import React from 'react'
import { render, screen } from '@testing-library/react'
import PostsPage from '../page'
import * as postService from '@/services/post.service'
import { supabase } from '@/lib/supabase'

jest.mock('@/services/post.service')
jest.mock('@/lib/supabase')

const mockCategories = [{ id: 1, slug: 'tech' }, { id: 2, slug: 'life' }]
const mockPosts = [{ id: 1, title: 'Test Post 1' }, { id: 2, title: 'Test Post 2' }]
const mockTotalCount = 2

describe('PostsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders posts when keyword is not provided', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValueOnce({ data: mockCategories }),
    })
    ;(postService.getPosts as jest.Mock).mockResolvedValueOnce({ data: mockPosts, count: mockTotalCount })

    render(<PostsPage searchParams={Promise.resolve({ page: '1' })} />)

    expect(await screen.findByText('全部文章')).toBeInTheDocument()
    expect(await screen.findByText('Test Post 1')).toBeInTheDocument()
    expect(await screen.findByText('Test Post 2')).toBeInTheDocument()
    expect(screen.getByText(`(${mockTotalCount})`)).toBeInTheDocument()
  })

  it('renders posts when a category is selected', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValueOnce({ data: mockCategories }),
    })
    ;(postService.getPosts as jest.Mock).mockResolvedValueOnce({ data: mockPosts, count: mockTotalCount })

    render(<PostsPage searchParams={Promise.resolve({ page: '1', category: 'tech' })} />)

    expect(await screen.findByText('全部文章')).toBeInTheDocument()
    expect(await screen.findByText('Test Post 1')).toBeInTheDocument()
  })

  it('renders posts when a keyword is provided', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValueOnce({ data: mockCategories }),
    })
    ;(postService.searchPosts as jest.Mock).mockResolvedValueOnce(mockPosts)

    render(<PostsPage searchParams={Promise.resolve({ q: 'Test' })} />)

    expect(await screen.findByText('全部文章')).toBeInTheDocument()
    expect(await screen.findByText('Test Post 1')).toBeInTheDocument()
  })

  it('renders no posts found when keyword does not match', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValueOnce({ data: mockCategories }),
    })
    ;(postService.searchPosts as jest.Mock).mockResolvedValueOnce([])

    render(<PostsPage searchParams={Promise.resolve({ q: 'No Match' })} />)

    expect(await screen.findByText('全部文章')).toBeInTheDocument()
    expect(screen.getByText('没有找到包含「No Match」的文章')).toBeInTheDocument()
  })

  it('renders no articles message when there are no posts', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
     
