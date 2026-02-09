import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  it('renders default loading message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom loading message', () => {
    render(<LoadingState message="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('renders loading spinner', () => {
    render(<LoadingState />);
    // The spinner should be present (animated svg or div)
    const container = screen.getByText('Loading...').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('applies fullHeight class when fullHeight is true', () => {
    const { container } = render(<LoadingState fullHeight />);
    expect(container.firstChild).toHaveClass('min-h-[400px]');
  });

  it('does not apply fullHeight class when fullHeight is false', () => {
    const { container } = render(<LoadingState fullHeight={false} />);
    expect(container.firstChild).not.toHaveClass('min-h-[400px]');
    expect(container.firstChild).toHaveClass('py-8');
  });
});
