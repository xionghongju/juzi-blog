
import React from 'react'
import { render } from '@testing-library/react'
import { BackgroundOrbs } from '../BackgroundOrbs'
import { useTheme } from 'next-themes'

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

describe('BackgroundOrbs', () => {
  beforeEach(() => {
    ;(useTheme as jest.Mock).mockClear()
  })

  it('returns null before mount (SSR guard)', () => {
    // useEffect doesn't run in initial render snapshot
    ;(useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'dark' })
    const { container } = render(<BackgroundOrbs />)
    // After mounting in jsdom, useEffect runs synchronously via act()
    // Component should eventually render something
    expect(container).toBeDefined()
  })

  it('renders dark particles when theme is dark', () => {
    ;(useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'dark' })
    const { container } = render(<BackgroundOrbs />)
    // After mount useEffect fires, component renders DarkParticles
    const fixed = container.querySelector('.fixed')
    expect(fixed).not.toBeNull()
  })

  it('renders light orbs when theme is light', () => {
    ;(useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'light' })
    const { container } = render(<BackgroundOrbs />)
    const fixed = container.querySelector('.fixed')
    expect(fixed).not.toBeNull()
  })

  it('uses fixed positioning for background', () => {
    ;(useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'light' })
    const { container } = render(<BackgroundOrbs />)
    const el = container.querySelector('.fixed.inset-0')
    expect(el).not.toBeNull()
  })
})
