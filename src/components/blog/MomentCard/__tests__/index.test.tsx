
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MomentCard } from '../index';
import { likeMoment } from '@/services/moment.service';
import { Moment } from '@/types';

jest.mock('@/services/moment.service');

const mockMoment: Moment = {
  id: '1',
  content: 'Test content',
  created_at: new Date().toISOString(),
  mood: 'happy',
  likes_count: 0,
  location: 'Test location',
  images: [],
};

describe('MomentCard', () => {
  it('renders correctly with default props', () => {
    render(<MomentCard moment={mockMoment} />);

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test location')).toBeInTheDocument();
  });

  it('displays the correct mood emoji', () => {
    render(<MomentCard moment={{ ...mockMoment, mood: 'happy' }} />);
    
    expect(screen.getByText('😊')).toBeInTheDocument(); // Assuming emoji for 'happy'
  });

  it('handles liking a moment', async () => {
    (likeMoment as jest.Mock).mockResolvedValueOnce(undefined);
    
    render(<MomentCard moment={mockMoment} />);
    
    const likeButton = screen.getByLabelText('点赞');
    fireEvent.click(likeButton);

    await waitFor(() => expect(likeMoment).toHaveBeenCalledWith(mockMoment.id));
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not allow liking twice', async () => {
    (likeMoment as jest.Mock).mockResolvedValueOnce(undefined);
    
    render(<MomentCard moment={mockMoment} />);
    
    const likeButton = screen.getByLabelText('点赞');
    fireEvent.click(likeButton);

    expect(likeMoment).toHaveBeenCalledTimes(1);
    
    fireEvent.click(likeButton);
    
    expect(likeMoment).toHaveBeenCalledTimes(1); // should not call again
  });

  it('handles moments with images', () => {
    const momentWithImages = {
      ...mockMoment,
      images: ['image1.png', 'image2.png', 'image3.png'],
    };
    render(<MomentCard moment={momentWithImages} />);

    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('handles moments without images', () => {
    render(<MomentCard moment={mockMoment} />);

    expect(screen.queryByRole('img')).toBeNull();
  });

  it('executes animation based on index and last prop', () => {
    render(<MomentCard moment={mockMoment} index={1} isLast={false} />);

    const card = screen.getByText('Test content').closest('div');
    expect(card).toHaveClass('pb-6');

    render(<MomentCard moment={mockMoment} index={2} isLast={true} />);
    const lastCard = screen.getByText('Test content').closest('div');
    expect(lastCard).toHaveClass('pb-0');
  });
});
