import { isMockMode } from '@/config/data-mode';
import { mockFundExpenses } from '@/data/mocks/back-office/fund-admin-ops';
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
  return payload;
}
