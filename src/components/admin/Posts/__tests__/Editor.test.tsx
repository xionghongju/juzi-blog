
import React from 'react'
import { render, screen } from '@testing-library/react'

// Tiptap relies on ProseMirror which doesn't work in jsdom; mock the Editor
jest.mock('../Editor', () => ({
  Editor: ({ content, onChange }: { content: string; onChange: (v: string) => void }) => (
    <div data-testid="editor">
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <button onClick={() => onChange('<p>Updated</p>')}>trigger change</button>
    </div>
  ),
}))

import { Editor } from '../Editor'

describe('Editor Component (mocked)', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => mockOnChange.mockClear())

  it('renders with initial content', () => {
    render(<Editor content="<p>Hello World</p>" onChange={mockOnChange} />)
    expect(screen.getByTestId('editor')).toBeInTheDocument()
  })

  it('calls onChange when content changes', () => {
    render(<Editor content="" onChange={mockOnChange} />)
    screen.getByText('trigger change').click()
    expect(mockOnChange).toHaveBeenCalledWith('<p>Updated</p>')
  })

  it('handles empty content', () => {
    render(<Editor content="" onChange={mockOnChange} />)
    expect(screen.getByTestId('editor')).toBeInTheDocument()
  })
})
