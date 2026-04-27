
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommentSection } from '../CommentSection'
import * as CommentService from '@/services/comment.service'
import { toast } from 'sonner'

jest.mock('@/services/comment.service')
jest.mock('sonner')

const mockComments = [
  {
    id: 1,
    author_name: 'User1',
    created_at: new Date(),
    content: 'This is a comment',
    replies: [],
  },
  {
    id: 2,
    author_name: 'User2',
    created_at: new Date(),
    content: 'This is another comment',
    replies: [],
  },
]

describe('CommentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders comments correctly', async () => {
    (CommentService.getCommentsWithReplies as jest.Mock).mockResolvedValue({ data: mockComments })

    render(<CommentSection postId={1} />)

    await waitFor(() => {
      expect(screen.getByText('评论(2)')).toBeInTheDocument()
      expect(screen.getByText('This is a comment')).toBeInTheDocument()
      expect(screen.getByText('This is another comment')).toBeInTheDocument()
    })
  })

  test('handles reply correctly', async () => {
    (CommentService.getCommentsWithReplies as jest.Mock).mockResolvedValue({ data: mockComments })

    render(<CommentSection postId={1} />)

    await waitFor(() => {
      fireEvent.click(screen.getByText('回复'))
    })

    expect(screen.getByText('回复 @User1')).toBeInTheDocument()
  })

  test('submits comment successfully', async () => {
    (CommentService.getCommentsWithReplies as jest.Mock).mockResolvedValue({ data: mockComments })
    (CommentService.createComment as jest.Mock).mockResolvedValue({ error: null })

    render(<CommentSection postId={1} />)

    await waitFor(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /昵称/i }), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByRole('textbox', { name: /邮箱/i }), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByRole('textbox', { name: /评论内容/i }), { target: { value: 'Valid comment content.' } })
      fireEvent.click(screen.getByRole('button', { name: /提交/i }))
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('评论已提交，审核通过后显示 ✨')
    })
  })

  test('shows error on invalid email', async () => {
    (CommentService.getCommentsWithReplies as jest.Mock).mockResolvedValue({ data: mockComments })

    render(<CommentSection postId={1} />)

    await waitFor(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /昵称/i }), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByRole('textbox', { name: /邮箱/i }), { target: { value: 'invalid_email' } })
      fireEvent.change(screen.getByRole('textbox', { name: /评论内容/i }), { target: { value: 'Valid comment content.' } })
      fireEvent.click(screen.getByRole('button', { name: /提交/i }))
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('请输入有效的邮箱地址')
    })
  })

  test('shows error when content exceeds limit', async () => {
    (CommentService.getCommentsWithReplies
