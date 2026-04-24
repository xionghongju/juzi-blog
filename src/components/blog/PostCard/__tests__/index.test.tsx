
import React from 'react'
import { render, screen } from '@testing-library/react'
import { PostCard } from '../index'
import { Post } from '@/types'

const mockPost: Partial<Post> = {
  id: 1,
  slug: 'test-slug',
  title: 'Test Title',
  cover_image: 'http://example.com/image.jpg',
  published_at: '2021-01-01',
  created_at: '2021-01-01',
  content: '<p>Test content for the post.</p>',
  excerpt: 'Test excerpt.',
  category: { id: 1, name: 'Test Category', slug: 'test-cat', color: null, description: null, created_at: '2021-01-01' },
  view_count: 100,
  tags: [],
}

describe('PostCard Component', () => {
  it('renders post title', () => {
    render(<PostCard post={mockPost as Post} featured={false} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders post excerpt', () => {
    render(<PostCard post={mockPost as Post} featured={false} />)
    expect(screen.getByText('Test excerpt.')).toBeInTheDocument()
  })

  it('renders category name', () => {
    render(<PostCard post={mockPost as Post} featured={false} />)
    expect(screen.getByText('Test Category')).toBeInTheDocument()
  })

  it('renders without cover image', () => {
    const postWithoutImage = { ...mockPost, cover_image: '' }
    render(<PostCard post={postWithoutImage as Post} featured={false} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('📝')).toBeInTheDocument()
  })

  it('handles no keyword gracefully', () => {
    render(<PostCard post={mockPost as Post} featured={false} keyword="" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('highlights keyword: splits into mark elements', () => {
    render(<PostCard post={mockPost as Post} featured={false} keyword="Test" />)
    const marks = document.querySelectorAll('mark')
    expect(marks.length).toBeGreaterThan(0)
    expect(marks[0].textContent).toBe('Test')
  })

  it('renders featured post card', () => {
    render(<PostCard post={mockPost as Post} featured={true} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test excerpt.')).toBeInTheDocument()
  })
})
