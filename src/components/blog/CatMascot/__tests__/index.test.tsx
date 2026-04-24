
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CatMascot } from '../index'

describe('CatMascot', () => {
  it('renders without crashing', () => {
    render(<CatMascot />)
    expect(screen.getByTitle('点我~')).toBeInTheDocument()
  })

  it('is clickable', () => {
    render(<CatMascot />)
    const el = screen.getByTitle('点我~')
    // Should not throw
    expect(() => fireEvent.click(el)).not.toThrow()
  })

  it('renders cat SVG', () => {
    const { container } = render(<CatMascot />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('has fixed positioning class', () => {
    const { container } = render(<CatMascot />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('fixed')
  })
})
