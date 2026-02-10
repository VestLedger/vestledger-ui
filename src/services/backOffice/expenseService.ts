import {
  mockFundExpenses,
} from '@/data/mocks/back-office/fund-admin-ops';
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
  const values = fundId ? expenseStore.filter((item) => item.fundId === fundId) : expenseStore;
  return clone(values);
}

export async function addFundExpense(payload: Omit<FundExpense, 'id'>): Promise<FundExpense> {
  const expense: FundExpense = {
    ...payload,
    id: `expense-${Date.now()}`,
  };
  expenseStore = [expense, ...expenseStore];
  return clone(expense);
}

export async function approveFundExpense(id: string, approver: string): Promise<FundExpense> {
  const index = findExpense(id);
  expenseStore[index] = {
    ...expenseStore[index],
    status: 'approved',
    approvedBy: approver,
  };
  return clone(expenseStore[index]);
}

export async function rejectFundExpense(id: string): Promise<FundExpense> {
  const index = findExpense(id);
  expenseStore[index] = {
    ...expenseStore[index],
    status: 'rejected',
  };
  return clone(expenseStore[index]);
}

export async function markFundExpensePaid(id: string): Promise<FundExpense> {
  const index = findExpense(id);
  expenseStore[index] = {
    ...expenseStore[index],
    status: 'paid',
    paidDate: new Date(),
  };
  return clone(expenseStore[index]);
}

export async function exportFundExpenses(
  format: 'csv' | 'pdf',
  fundId?: string
): Promise<{ format: 'csv' | 'pdf'; fundId?: string; exportedAt: string }> {
  if (fundId) {
    expenseStore.some((item) => item.fundId === fundId);
  }
  return {
    format,
    fundId,
    exportedAt: new Date().toISOString(),
  };
}
