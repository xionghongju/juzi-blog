
import React from 'react'
import { render, screen } from '@testing-library/react'
import { AiChat } from '../index'

describe('AiChat', () => {
  it('renders the robot button when closed', () => {
    render(<AiChat />)
    expect(screen.getByLabelText('AI 助手')).toBeInTheDocument()
  })

  it('opens chat panel on click', async () => {
    render(<AiChat />)
    screen.getByLabelText('AI 助手').click()
    expect(await screen.findByText('橘子小助手')).toBeInTheDocument()
  })

  it('shows welcome message after opening', async () => {
    render(<AiChat />)
    screen.getByLabelText('AI 助手').click()
    expect(await screen.findByText(/嗨！我是橘子小助手/)).toBeInTheDocument()
  })

  it('renders close button when open', async () => {
    render(<AiChat />)
    screen.getByLabelText('AI 助手').click()
    expect(await screen.findByLabelText('关闭')).toBeInTheDocument()
  })
})
