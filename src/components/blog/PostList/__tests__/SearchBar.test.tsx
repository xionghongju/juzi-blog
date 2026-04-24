
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SearchBar } from '../SearchBar'
import { useRouter, useSearchParams } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

const mockPush = jest.fn()

beforeEach(() => {
  ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  jest.useFakeTimers()
  mockPush.mockClear()
})

afterEach(() => {
  jest.useRealTimers()
  jest.clearAllMocks()
})

describe('SearchBar', () => {
  it('renders search input', () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText('搜索文章...')).toBeInTheDocument()
  })

  it('renders with initial search param from URL', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('q=initial'))
    render(<SearchBar />)
    expect(screen.getByPlaceholderText('搜索文章...')).toHaveValue('initial')
  })

  it('updates input value on change', () => {
    render(<SearchBar />)
    const input = screen.getByPlaceholderText('搜索文章...')
    fireEvent.change(input, { target: { value: 'react hooks' } })
    expect(input).toHaveValue('react hooks')
  })

  it('calls router.push after debounce delay', () => {
    render(<SearchBar />)
    const input = screen.getByPlaceholderText('搜索文章...')
    fireEvent.change(input, { target: { value: 'test search' } })
    // Before debounce fires, push should not be called
    expect(mockPush).not.toHaveBeenCalled()
    // Advance past debounce delay (350ms)
    act(() => { jest.advanceTimersByTime(400) })
    expect(mockPush).toHaveBeenCalled()
  })

  it('clears input when value is empty', () => {
    render(<SearchBar />)
    const input = screen.getByPlaceholderText('搜索文章...')
    fireEvent.change(input, { target: { value: '' } })
    expect(input).toHaveValue('')
  })
})
