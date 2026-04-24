import React from 'react'

const motion = new Proxy({} as Record<string, unknown>, {
  get: (_: Record<string, unknown>, key: string) => {
    const Component = React.forwardRef(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ children, animate, initial, exit, transition, variants, whileHover, whileTap, whileInView, style, ...props }: any, ref: any) =>
        React.createElement(key, { ...props, style, ref }, children)
    )
    Component.displayName = `motion.${key}`
    return Component
  },
})

const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>
AnimatePresence.displayName = 'AnimatePresence'

const useAnimation = () => ({
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn(),
  set: jest.fn(),
})

const useInView = () => true

const useMotionValue = (initial: number) => ({
  get: () => initial,
  set: jest.fn(),
  onChange: jest.fn(),
})

export { motion, AnimatePresence, useAnimation, useInView, useMotionValue }
