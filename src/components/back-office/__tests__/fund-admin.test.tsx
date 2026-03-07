import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FundAdmin } from '@/components/back-office/fund-admin';

const useAsyncDataMock = vi.fn();
const useUIKeyMock = vi.fn();
const dispatchMock = vi.fn(() => ({ unwrap: vi.fn() }));

const fakeState = {
  auth: {
    user: {
      id: 'user-1',
      name: 'Ops User',
      email: 'ops@example.com',
      role: 'ops',
    },
  },
  fund: {
    data: {
      funds: [
        {
          id: 'fund-1',
          name: 'Fund I',
        },
      ],
    },
    archivedFundIds: [],
    selectedFundId: 'fund-1',
    viewMode: 'individual',
    hydrated: true,
    mutationStatus: 'idle',
    mutationError: undefined,
  },
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: typeof fakeState) => unknown) => selector(fakeState),
}));

vi.mock('@/contexts/fund-context', () => ({
  useFund: () => ({
    selectedFund: { id: 'fund-1', name: 'Fund I' },
    viewMode: 'individual',
  }),
}));

vi.mock('@/store/ui', () => ({
  useUIKey: (...args: unknown[]) => useUIKeyMock(...args),
}));

vi.mock('@/hooks/useAsyncData', () => ({
  useAsyncData: (...args: unknown[]) => useAsyncDataMock(...args),
}));

vi.mock('@/ui', () => ({
  Card: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Button: ({ children }: { children?: ReactNode }) => <button type="button">{children}</button>,
  Progress: () => <div />,
  Select: () => <div />,
  Modal: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Input: () => <input />,
}));

vi.mock('@/ui/composites', () => ({
  PageScaffold: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SectionHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  KeyValueRow: () => <div />,
  StatusBadge: () => <div />,
}));

vi.mock('@/ui/async-states', () => ({
  AsyncStateRenderer: ({
    children,
  }: {
    children: (data: { capitalCalls: unknown[]; lpResponses: unknown[] }) => ReactNode;
  }) => <>{children({ capitalCalls: [], lpResponses: [] })}</>,
}));

vi.mock('@/components/fund-selector', () => ({
  FundSelector: () => <div />,
}));

vi.mock('@/components/fund-admin/carried-interest-tracker', () => ({
  CarriedInterestTracker: () => <div />,
}));

vi.mock('@/components/fund-admin/expense-tracker', () => ({
  ExpenseTracker: () => <div />,
}));

vi.mock('@/components/fund-admin/nav-calculator', () => ({
  NAVCalculator: () => <div />,
}));

vi.mock('@/components/fund-admin/transfer-secondary', () => ({
  TransferSecondary: () => <div />,
}));

vi.mock('@/components/fund-admin/distributions/distributions-list', () => ({
  DistributionsList: () => <div />,
}));

vi.mock('@/components/fund-admin/fund-setup-list', () => ({
  FundSetupList: () => <div />,
}));

describe('FundAdmin tab fetch gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAsyncDataMock
      .mockReturnValueOnce({
        data: { capitalCalls: [], lpResponses: [] },
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      })
      .mockReturnValue({
        data: null,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      });
  });

  it('only fetches NAV data on mount when the nav tab is active', () => {
    useUIKeyMock.mockReturnValue({
      value: { selectedTab: 'nav-calculator', lpStatusFilter: 'all' },
      patch: vi.fn(),
    });

    render(<FundAdmin />);

    expect(useAsyncDataMock).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ fetchOnMount: true })
    );
    expect(useAsyncDataMock).toHaveBeenNthCalledWith(
      3,
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ fetchOnMount: false })
    );
    expect(useAsyncDataMock).toHaveBeenNthCalledWith(
      4,
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ fetchOnMount: false })
    );
    expect(useAsyncDataMock).toHaveBeenNthCalledWith(
      5,
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ fetchOnMount: false })
    );
  });

  it('switches the conditional fetch target when a different tab is active', () => {
    useUIKeyMock.mockReturnValue({
      value: { selectedTab: 'carried-interest', lpStatusFilter: 'all' },
      patch: vi.fn(),
    });

    render(<FundAdmin />);

    expect(useAsyncDataMock).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ fetchOnMount: false })
    );
    expect(useAsyncDataMock).toHaveBeenNthCalledWith(
      3,
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ fetchOnMount: true })
    );
  });
});
