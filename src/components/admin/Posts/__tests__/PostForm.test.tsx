
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostForm } from '../PostForm'
import { createPost, syncPostTags } from '@/services/post.service'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))
jest.mock('@/services/post.service', () => ({
  createPost: jest.fn(),
  updatePost: jest.fn(),
  syncPostTags: jest.fn(),
}))
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))
jest.mock('@/components/admin/Posts/Editor', () => ({
  Editor: ({ onChange }: { onChange: (v: string) => void }) => (
    <textarea data-testid="mock-editor" onChange={e => onChange(e.target.value)} />
  ),
}))
jest.mock('@/app/api/unsplash/route', () => ({}), { virtual: true })

const categories = [{ id: 1, name: 'Tech', slug: 'tech', color: null, description: null, created_at: '2021-01-01' }]
const allTags = [{ id: 1, name: 'React', slug: 'react', created_at: '2021-01-01' }]

describe('PostForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders form fields for new post', () => {
    render(<PostForm categories={categories} allTags={allTags} />)
    expect(screen.getByPlaceholderText(/文章标题/i)).toBeInTheDocument()
  })

  it('updates title input on change', () => {
    render(<PostForm categories={categories} allTags={allTags} />)
    const input = screen.getByPlaceholderText(/文章标题/i)
    fireEvent.change(input, { target: { value: 'My New Post' } })
    expect(input).toHaveValue('My New Post')
  })

  it('calls createPost when saving draft with title filled', async () => {
    ;(createPost as jest.Mock).mockResolvedValueOnce({ data: { id: 99 }, error: null })
    ;(syncPostTags as jest.Mock).mockResolvedValueOnce({ error: null })
    render(<PostForm categories={categories} allTags={allTags} />)
    // Fill in required title first
    fireEvent.change(screen.getByPlaceholderText('输入文章标题...'), { target: { value: 'My Draft Post' } })
    fireEvent.click(screen.getByText('存草稿'))
    await waitFor(() => expect(createPost).toHaveBeenCalled())
  })
})
