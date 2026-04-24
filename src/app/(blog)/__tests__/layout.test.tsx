import React from 'react'
import { render, screen } from '@testing-library/react'
import BlogLayout from '../layout'

jest.mock('@/components/blog/AiChat', () => ({
  AiChat: () => <div data-testid="ai-chat">AiChat</div>,
}))
jest.mock('@/components/blog/CatMascot', () => ({
  CatMascot: () => <div data-testid="cat-mascot">CatMascot</div>,
}))
jest.mock('@/components/blog/BackgroundOrbs', () => ({
  BackgroundOrbs: () => <div data-testid="background-orbs">BackgroundOrbs</div>,
}))
jest.mock('@/components/blog/Navbar', () => ({
  Navbar: () => <nav>Navbar</nav>,
}))

describe('BlogLayout', () => {
  test('renders children correctly', () => {
    render(<BlogLayout><div>Test Child</div></BlogLayout>)
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  test('renders Navbar', () => {
    render(<BlogLayout><div /></BlogLayout>)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('renders BackgroundOrbs', () => {
    render(<BlogLayout><div /></BlogLayout>)
    expect(screen.getByTestId('background-orbs')).toBeInTheDocument()
  })

  test('renders CatMascot', () => {
    render(<BlogLayout><div /></BlogLayout>)
    expect(screen.getByTestId('cat-mascot')).toBeInTheDocument()
  })

  test('renders AiChat', () => {
    render(<BlogLayout><div /></BlogLayout>)
    expect(screen.getByTestId('ai-chat')).toBeInTheDocument()
  })

  test('renders footer with current year', () => {
    render(<BlogLayout><div /></BlogLayout>)
    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year} 橘子的博客 · 用心记录每一天`)).toBeInTheDocument()
  })
})
