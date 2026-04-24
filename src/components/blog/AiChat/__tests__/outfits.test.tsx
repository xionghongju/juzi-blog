
import React from 'react'
import { render } from '@testing-library/react'
import { OUTFITS } from '../outfits'

describe('OUTFITS', () => {
  it('should have 7 outfit definitions', () => {
    expect(OUTFITS.length).toBe(7)
  })

  it('should have correct names for each outfit', () => {
    const outfitNames = OUTFITS.map(outfit => outfit.name)
    expect(outfitNames).toEqual([
      '素颜出镜',
      '西装革履',
      '大厨当家',
      '宇宙飞行员',
      '足球少年',
      '超级英雄',
      '橘子农夫',
    ])
  })

  it('should have valid emoji for each outfit', () => {
    const outfitEmojis = OUTFITS.map(outfit => outfit.emoji)
    expect(outfitEmojis).toEqual(['🤖', '👔', '👨‍🍳', '🚀', '⚽', '🦸', '🌾'])
  })

  it('should have non-empty bodyColor for each outfit', () => {
    OUTFITS.forEach(outfit => {
      expect(outfit.bodyColor).toBeTruthy()
    })
  })

  it('should render each outfit without crashing', () => {
    OUTFITS.forEach(outfit => {
      const { container } = render(<svg>{outfit.render()}</svg>)
      expect(container).toBeDefined()
    })
  })
})
