
import React from 'react';
import { render, screen } from '@testing-library/react';
import { motion, AnimatePresence, useAnimation, useInView, useMotionValue } from '../framer-motion';

describe('framer-motion mocks', () => {
  
  test('renders motion component correctly', () => {
    const TestComponent = motion.div;
    render(<TestComponent>Hello World</TestComponent>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('attaches props correctly to motion component', () => {
    const TestComponent = motion.div;
    render(<TestComponent data-testid="test" style={{ color: 'red' }}>Test</TestComponent>);
    const element = screen.getByTestId('test');
    expect(element).toHaveStyle('color: red');
  });

  test('AnimatePresence renders its children', () => {
    render(
      <AnimatePresence>
        <div>Child Component</div>
      </AnimatePresence>
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  test('useAnimation hook returns methods', async () => {
    const { start, stop, set } = useAnimation();
    await start();
    expect(start).toHaveBeenCalled();
    expect(stop).toBeInstanceOf(Function);
    expect(set).toBeInstanceOf(Function);
  });

  test('useInView hook returns true', () => {
    const result = useInView();
    expect(result).toBe(true);
  });

  test('useMotionValue returns initial value and methods', () => {
    const { get, set, onChange } = useMotionValue(10);
    expect(get()).toBe(10);
    expect(set).toBeInstanceOf(Function);
    expect(onChange).toBeInstanceOf(Function);
  });

});
