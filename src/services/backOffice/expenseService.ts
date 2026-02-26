import { isMockMode } from '@/config/data-mode';
import { mockFundExpenses } from '@/data/seeds/back-office/fund-admin-ops';
import { logger } from '@/lib/logger';
import { requestJson } from '@/services/shared/httpClient';
import type { FundExpense } from '@/types/fundAdminOps';

const clone = <T>(value: T): T => structuredClone(value);

let expenseStore: FundExpense[] = clone(mockFundExpenses);

function findExpense(id: string) {
  const index = expenseStore.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Expense not found: ${id}`);
  }
  return index;
}

function buildFallbackExpense(overrides: Partial<FundExpense> = {}): FundExpense {
  const now = new Date();
  const template = mockFundExpenses[0];
  const base: FundExpense = template
    ? {
        ...clone(template),
        date: now,
        paidDate: undefined,
      }
    : {
        id: `expense-${Date.now()}`,
        fundId: '',
        fundName: 'Unknown fund',
        type: 'other',
        category: 'General',
        description: 'Fallback expense',
        amount: 0,
        date: now,
        payee: 'Unknown payee',
        status: 'pending',
        isRecurring: false,
        allocatedToLPs: false,
      };

  return {
    ...base,
    ...overrides,
    id: overrides.id ?? base.id ?? `expense-${Date.now()}`,
    fundId: overrides.fundId ?? base.fundId ?? '',
    fundName: overrides.fundName ?? base.fundName ?? 'Unknown fund',
    date: overrides.date ?? base.date ?? now,
  };
}

function upsertExpense(next: FundExpense) {
  const index = expenseStore.findIndex((item) => item.id === next.id);
  if (index === -1) {
    expenseStore = [next, ...expenseStore];
    return;
  }
  expenseStore[index] = next;
}

export async function getFundExpenses(fundId?: string): Promise<FundExpense[]> {
  if (isMockMode('backOffice')) {
    const values = fundId ? expenseStore.filter((item) => item.fundId === fundId) : expenseStore;
    return clone(values);
  }

  if (!fundId) return [];
  const payload = await requestJson<FundExpense[]>(`/funds/${fundId}/expenses`, {
    fallbackMessage: 'Failed to load expenses',
  });
  return Array.isArray(payload) ? payload : [];
}

export async function addFundExpense(payload: Omit<FundExpense, 'id'>): Promise<FundExpense> {
  if (isMockMode('backOffice')) {
    const expense: FundExpense = { ...payload, id: `expense-${Date.now()}` };
    expenseStore = [expense, ...expenseStore];
    return clone(expense);
  }

  const result = await requestJson<FundExpense>(`/funds/${payload.fundId}/expenses`, {
    method: 'POST',
    body: payload,
    fallbackMessage: 'Failed to create expense',
  });
  if (!result) {
    logger.warn('Empty create expense payload from API; using fallback', {
      component: 'expenseService',
      fundId: payload.fundId,
    });
    const fallback = buildFallbackExpense({
      ...payload,
      id: `expense-${Date.now()}`,
      status: payload.status ?? 'pending',
    });
    upsertExpense(fallback);
    return clone(fallback);
  }
  return result;
}

export async function approveFundExpense(id: string, approver: string): Promise<FundExpense> {
  if (isMockMode('backOffice')) {
    const index = findExpense(id);
    expenseStore[index] = { ...expenseStore[index], status: 'approved', approvedBy: approver };
    return clone(expenseStore[index]);
  }

  const payload = await requestJson<FundExpense>(`/expenses/${id}/approve`, {
    method: 'POST',
    body: { approver },
    fallbackMessage: 'Failed to approve expense',
  });
  if (!payload) {
    logger.warn('Empty approve expense payload from API; using fallback', {
      component: 'expenseService',
      expenseId: id,
      approver,
    });
    const existing = expenseStore.find((item) => item.id === id);
    const fallback = buildFallbackExpense({
      ...(existing ?? {}),
      id,
      status: 'approved',
      approvedBy: approver,
    });
    upsertExpense(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function rejectFundExpense(id: string): Promise<FundExpense> {
  if (isMockMode('backOffice')) {
    const index = findExpense(id);
    expenseStore[index] = { ...expenseStore[index], status: 'rejected' };
    return clone(expenseStore[index]);
  }

  const payload = await requestJson<FundExpense>(`/expenses/${id}/reject`, {
    method: 'POST',
    fallbackMessage: 'Failed to reject expense',
  });
  if (!payload) {
    logger.warn('Empty reject expense payload from API; using fallback', {
      component: 'expenseService',
      expenseId: id,
    });
    const existing = expenseStore.find((item) => item.id === id);
    const fallback = buildFallbackExpense({
      ...(existing ?? {}),
      id,
      status: 'rejected',
    });
    upsertExpense(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function markFundExpensePaid(id: string): Promise<FundExpense> {
  if (isMockMode('backOffice')) {
    const index = findExpense(id);
    expenseStore[index] = { ...expenseStore[index], status: 'paid', paidDate: new Date() };
    return clone(expenseStore[index]);
  }

  const payload = await requestJson<FundExpense>(`/expenses/${id}/pay`, {
    method: 'POST',
    fallbackMessage: 'Failed to mark expense as paid',
  });
  if (!payload) {
    logger.warn('Empty pay expense payload from API; using fallback', {
      component: 'expenseService',
      expenseId: id,
    });
    const existing = expenseStore.find((item) => item.id === id);
    const fallback = buildFallbackExpense({
      ...(existing ?? {}),
      id,
      status: 'paid',
      paidDate: new Date(),
    });
    upsertExpense(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function exportFundExpenses(
  format: 'csv' | 'pdf',
  fundId?: string
): Promise<{ format: 'csv' | 'pdf'; fundId?: string; exportedAt: string }> {
  if (isMockMode('backOffice')) {
    return { format, fundId, exportedAt: new Date().toISOString() };
  }

  const path = fundId ? `/funds/${fundId}/expenses/export` : '/expenses/export';
  const payload = await requestJson<{ format: 'csv' | 'pdf'; fundId?: string; exportedAt: string }>(path, {
    query: { format },
    fallbackMessage: 'Failed to export expenses',
  });
  if (!payload) {
    logger.warn('Empty expense export payload from API; using fallback metadata', {
      component: 'expenseService',
      format,
      fundId,
    });
    return { format, fundId, exportedAt: new Date().toISOString() };
  }
  return payload;
}
