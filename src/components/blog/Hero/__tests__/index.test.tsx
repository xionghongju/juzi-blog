
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Hero } from '../index'

describe('Hero Component', () => {
  it('renders greeting text', () => {
    render(<Hero />)
    expect(screen.getByText(/嗨，我是/)).toBeInTheDocument()
    expect(screen.getByText('橘子')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<Hero />)
    expect(screen.getByText(/这里是我的个人空间/)).toBeInTheDocument()
  })

  it('renders stat labels', () => {
    render(<Hero postCount={10} momentCount={5} startDate="2023-01-01" />)
    expect(screen.getByText('篇文章')).toBeInTheDocument()
    expect(screen.getByText('条动态')).toBeInTheDocument()
    expect(screen.getByText('天坚持')).toBeInTheDocument()
  })

  it('renders Tech Stack section', () => {
    render(<Hero />)
    expect(screen.getByText('Tech Stack')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders CTA links', () => {
    render(<Hero />)
    expect(screen.getByText('查看文章')).toBeInTheDocument()
    expect(screen.getByText('关于我')).toBeInTheDocument()
  })
})
