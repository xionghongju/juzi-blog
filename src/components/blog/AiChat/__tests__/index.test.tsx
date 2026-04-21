
import React from 'react';
import { render, screen } from '@testing-library/react';
import { pickAction, SpeechBubble, RobotCharacter } from '../index';

describe('pickAction', () => {
  it('should return a valid action', () => {
    const actions = ['idle', 'wave', 'dance', 'jump', 'think'];
    const action = pickAction();
    expect(actions).toContain(action);
  });
});

describe('SpeechBubble', () => {
  it('renders the correct text', () => {
    const text = 'Test message';
    render(<SpeechBubble text={text} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
  
  it('renders without crashing', () => {
    render(<SpeechBubble text="Hello" />);
  });
});

describe('RobotCharacter', () => {
  it('renders without crashing with action "idle"', () => {
    render(<RobotCharacter action="idle" />);
    expect(screen.getByRole('svg')).toBeInTheDocument();
  });

  it('renders without crashing with action "wave"', () => {
    render(<RobotCharacter action="wave" />);
    expect(screen.getByRole('svg')).toBeInTheDocument();
  });
  
  it('renders without crashing with action "dance"', () => {
    render(<RobotCharacter action="dance" />);
    expect(screen.getByRole('svg')).toBeInTheDocument();
  });

  it('renders without crashing with action "jump"', () => {
    render(<RobotCharacter action="jump" />);
    expect(screen.getByRole('svg')).toBeInTheDocument();
  });

  it('renders without crashing with action "think"', () => {
    render(<RobotCharacter action="think" />);
    expect(screen.getByRole('svg')).toBeInTheDocument();
  });
});
