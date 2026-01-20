import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsCard } from './StatsCard';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

describe('StatsCard', () => {
  it('renders title and value', () => {
    render(<StatsCard title="Total Revenue" value="$1,250,000" icon={DollarSign} />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,250,000')).toBeInTheDocument();
  });

  it('renders numeric value', () => {
    render(<StatsCard title="Users" value={1234} icon={Users} />);
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders icon', () => {
    const { container } = render(
      <StatsCard title="Growth" value="25%" icon={TrendingUp} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <StatsCard
        title="Active Users"
        value={500}
        icon={Users}
        subtitle="Last 30 days"
      />
    );
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('renders trend with up direction', () => {
    render(
      <StatsCard
        title="Revenue"
        value="$100K"
        icon={DollarSign}
        trend={{ value: '+15%', direction: 'up' }}
      />
    );
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('renders trend with down direction', () => {
    render(
      <StatsCard
        title="Churn"
        value="5%"
        icon={Users}
        trend={{ value: '-2%', direction: 'down' }}
      />
    );
    expect(screen.getByText('-2%')).toBeInTheDocument();
  });

  it('renders trend with neutral direction', () => {
    render(
      <StatsCard
        title="Rate"
        value="10%"
        icon={TrendingUp}
        trend={{ value: '0%', direction: 'neutral' }}
      />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <StatsCard
        title="Clickable"
        value={100}
        icon={Users}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByText('Clickable').closest('div')!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies cursor-pointer class when onClick is provided', () => {
    const { container } = render(
      <StatsCard
        title="Clickable"
        value={100}
        icon={Users}
        onClick={() => {}}
      />
    );
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });

  it('does not apply cursor-pointer class when onClick is not provided', () => {
    const { container } = render(
      <StatsCard title="Not Clickable" value={100} icon={Users} />
    );
    expect(container.firstChild).not.toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatsCard
        title="Custom"
        value={100}
        icon={Users}
        className="my-custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('renders with primary variant by default', () => {
    render(<StatsCard title="Default" value={100} icon={Users} />);
    // Component should render without error with default variant
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(
      <StatsCard title="Success" value={100} icon={Users} variant="success" />
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders with warning variant', () => {
    render(
      <StatsCard title="Warning" value={100} icon={Users} variant="warning" />
    );
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('renders with danger variant', () => {
    render(
      <StatsCard title="Danger" value={100} icon={Users} variant="danger" />
    );
    expect(screen.getByText('Danger')).toBeInTheDocument();
  });
});
