import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { Inbox, FileText, Users } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState icon={Inbox} title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders message when provided', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No items"
        message="Add your first item to get started"
      />
    );
    expect(screen.getByText('Add your first item to get started')).toBeInTheDocument();
  });

  it('renders icon', () => {
    const { container } = render(<EmptyState icon={FileText} title="No files" />);
    // Check that an SVG (the icon) is present
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    const actionButton = <button>Create New</button>;
    render(<EmptyState icon={Users} title="No users" action={actionButton} />);
    expect(screen.getByRole('button', { name: 'Create New' })).toBeInTheDocument();
  });

  it('does not render message when not provided', () => {
    render(<EmptyState icon={Inbox} title="No items" />);
    // Title should be present but no additional message
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('has centered layout with minimum height', () => {
    const { container } = render(
      <EmptyState icon={Inbox} title="Empty" />
    );
    expect(container.firstChild).toHaveClass('min-h-[300px]');
    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('items-center');
    expect(container.firstChild).toHaveClass('justify-center');
  });
});
