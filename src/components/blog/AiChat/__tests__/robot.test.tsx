
import React from 'react'
import { render, screen } from '@testing-library/react'
import { pickAction, SpeechBubble, OutfitBadge, RobotCharacter, WELCOME } from '../robot'
import { OUTFITS } from '../outfits'

describe('pickAction', () => {
  it('returns a valid action from the allowed set', () => {
    const allowed = new Set(['idle', 'wave', 'dance', 'jump', 'think'])
    for (let i = 0; i < 100; i++) {
      expect(allowed.has(pickAction())).toBe(true)
    }
  })

  it('returns all possible actions across many calls', () => {
    const results = new Set(Array.from({ length: 1000 }, pickAction))
    expect(results.size).toBeGreaterThan(1)
  })
})

describe('SpeechBubble', () => {
  it('renders provided text', () => {
    render(<SpeechBubble text={WELCOME.text} />)
    expect(screen.getByText(WELCOME.text)).toBeInTheDocument()
  })

  it('renders custom text', () => {
    render(<SpeechBubble text="测试消息" />)
    expect(screen.getByText('测试消息')).toBeInTheDocument()
  })
})

describe('OutfitBadge', () => {
  it('renders outfit name and emoji', () => {
    const outfit = OUTFITS[0]
    render(<OutfitBadge outfit={outfit} />)
    expect(screen.getByText(`${outfit.emoji} ${outfit.name}`)).toBeInTheDocument()
  })
})

describe('RobotCharacter', () => {
  const outfit = OUTFITS[0]
  const actions = ['idle', 'wave', 'dance', 'jump', 'think'] as const

  actions.forEach(action => {
    it(`renders without crashing with action "${action}"`, () => {
      const { container } = render(<RobotCharacter action={action} outfit={outfit} />)
      expect(container.querySelector('svg')).not.toBeNull()
    })
  })
})
