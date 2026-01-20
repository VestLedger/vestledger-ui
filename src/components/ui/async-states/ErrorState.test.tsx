import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from './ErrorState';
import type { NormalizedError } from '@/store/types/AsyncState';

describe('ErrorState', () => {
  const mockError: NormalizedError = {
    message: 'Failed to load data',
    code: 'FETCH_ERROR',
  };

  it('renders error message', () => {
    render(<ErrorState error={mockError} />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<ErrorState error={mockError} title="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders default title when not provided', () => {
    render(<ErrorState error={mockError} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState error={mockError} onRetry={onRetry} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState error={mockError} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorState error={mockError} />);
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('renders error code when available', () => {
    render(<ErrorState error={mockError} />);
    // Error code is displayed in format "Error code: CODE"
    expect(screen.getByText(/Error code: FETCH_ERROR/)).toBeInTheDocument();
  });

  it('handles error without code', () => {
    const errorWithoutCode: NormalizedError = {
      message: 'Unknown error occurred',
    };
    render(<ErrorState error={errorWithoutCode} />);
    expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
  });
});
