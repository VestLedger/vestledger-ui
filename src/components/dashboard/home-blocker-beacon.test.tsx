import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HomeBlockerBeacon } from './home-blocker-beacon';
import type { HomeBlocker } from '@/data/mocks/hooks/dashboard-data';

const blockers: HomeBlocker[] = [
  {
    id: 'blocker-1',
    sourceId: 'brief-task-1',
    title: 'Bridge extension decision for BioTech',
    description: 'Runway approaching threshold; decision required today.',
    blockedDays: 3,
    severity: 'critical',
    lane: 'Portfolio',
    route: '/portfolio',
  },
  {
    id: 'blocker-2',
    sourceId: 'brief-task-2',
    title: 'LP overdue follow-up for Fund II',
    description: 'Two LP commitments are still overdue.',
    blockedDays: 2,
    severity: 'warning',
    lane: 'LP Relations',
    route: '/fund-admin',
    tabTarget: 'capital-calls',
  },
];

describe('HomeBlockerBeacon', () => {
  it('renders blocker count and opens dropdown', () => {
    render(<HomeBlockerBeacon blockers={blockers} onBlockerClick={() => {}} />);

    const trigger = screen.getByTestId('gp-home-blockers-beacon-trigger');
    expect(trigger).toHaveTextContent('Blocked on You');
    expect(trigger).toHaveTextContent('2');

    fireEvent.click(trigger);
    expect(screen.getByTestId('gp-home-blockers-beacon-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Bridge extension decision for BioTech')).toBeInTheDocument();
  });

  it('calls onBlockerClick when selecting dropdown item', () => {
    const onBlockerClick = vi.fn();
    render(<HomeBlockerBeacon blockers={blockers} onBlockerClick={onBlockerClick} />);

    fireEvent.click(screen.getByTestId('gp-home-blockers-beacon-trigger'));
    fireEvent.click(screen.getByText('LP overdue follow-up for Fund II'));

    expect(onBlockerClick).toHaveBeenCalledTimes(1);
    expect(onBlockerClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'blocker-2' }));
  });
});
