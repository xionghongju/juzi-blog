
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';
import { useRouter, useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('SearchBar', () => {
  it('renders with initial search param', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('q=initial'));
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('搜索文章...')).toHaveValue('initial');
  });

  it('updates search input when search param changes', () => {
    const { rerender } = render(<SearchBar />);
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('q=first'));
    
    rerender(<SearchBar />);
    expect(screen.getByPlaceholderText('搜索文章...')).toHaveValue('first');

    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('q=second'));
    rerender(<SearchBar />);
    expect(screen.getByPlaceholderText('搜索文章...')).toHaveValue('second');
  });

  it('handles input change and executes search', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('搜索文章...');
    fireEvent.change(input, { target: { value: 'test search' } });

    expect(screen.getByPlaceholderText('搜索文章...')).toHaveValue('test search');
    expect(mockPush).toHaveBeenCalledWith('/posts?q=test+search');
  });

  it('handles input change with empty value', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('搜索文章...');
    fireEvent.change(input, { target: { value: '' } });

    expect(screen.getByPlaceholderText('搜索文章...')).toHaveValue('');
    expect(mockPush).toHaveBeenCalledWith('/posts');
  });
});
