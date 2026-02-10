import { isMockMode } from '@/config/data-mode';
import {
  mockCapitalCalls,
  mockDistributions,
  mockLPResponses,
  type CapitalCall,
  type Distribution,
  type LPResponse,
} from '@/data/mocks/back-office/fund-admin';
import { mockFunds } from '@/data/mocks/funds';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

interface ApiCapitalCall {
  id: string;
  fundId: string;
  callNumber: number;
  amount: number;
  collected: number;
  dueDate: string;
  status: string;
  purpose?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCapitalCallParams {
  fundId: string;
  fundName: string;
  totalAmount: number;
  dueDate: string;
  purpose: string;
  callDate?: string;
}

const clone = <T>(value: T): T => structuredClone(value);

function getFundName(fundId: string): string {
  return mockFunds.find((fund) => fund.id === fundId)?.name ?? 'Unknown Fund';
}

function mapApiToCapitalCall(api: ApiCapitalCall, fundName: string): CapitalCall {
  const statusMap: Record<string, CapitalCall['status']> = {
    pending: 'sent',
    partial: 'in-progress',
    complete: 'completed',
    overdue: 'in-progress',
  };

  return {
    id: api.id,
    fundId: api.fundId,
    callNumber: api.callNumber,
    fundName,
    callDate: api.createdAt.split('T')[0],
    dueDate: api.dueDate.split('T')[0],
    totalAmount: api.amount,
    amountReceived: api.collected,
    lpCount: 0,
    lpsResponded: 0,
    status: statusMap[api.status] ?? 'draft',
    purpose: api.purpose ?? '',
  };
}

function upsertCapitalCall(value: CapitalCall): CapitalCall {
  const index = mockCapitalCalls.findIndex((item) => item.id === value.id);
  if (index === -1) {
    mockCapitalCalls.unshift(value);
    return value;
  }
  mockCapitalCalls[index] = value;
  return value;
}

function upsertLPResponse(value: LPResponse): LPResponse {
  const index = mockLPResponses.findIndex((item) => item.id === value.id);
  if (index === -1) {
    mockLPResponses.unshift(value);
    return value;
  }
  mockLPResponses[index] = value;
  return value;
}

export async function getCapitalCalls(fundId?: string): Promise<CapitalCall[]> {
  if (isMockMode('backOffice')) {
    const calls = fundId
      ? mockCapitalCalls.filter((call) => call.fundId === fundId)
      : mockCapitalCalls;
    return clone(calls);
  }

  if (!fundId) {
    const result = await unwrapApiResult(
      apiClient.GET('/capital-calls/active'),
      { fallbackMessage: 'Failed to fetch active capital calls' }
    );
    return ((result as unknown as (ApiCapitalCall & { fund?: { name: string } })[]) ?? []).map((cc) =>
      mapApiToCapitalCall(cc, cc.fund?.name ?? getFundName(cc.fundId))
    );
  }

  const result = await unwrapApiResult(
    apiClient.GET('/funds/{fundId}/capital-calls', {
      params: { path: { fundId } },
    }),
    { fallbackMessage: 'Failed to fetch capital calls' }
  );

  return ((result as unknown as ApiCapitalCall[]) ?? []).map((cc) =>
    mapApiToCapitalCall(cc, getFundName(cc.fundId || fundId))
  );
}

export async function createCapitalCall(params: CreateCapitalCallParams): Promise<CapitalCall> {
  if (isMockMode('backOffice')) {
    const nextCallNumber = Math.max(0, ...mockCapitalCalls.map((call) => call.callNumber)) + 1;
    const next: CapitalCall = {
      id: `call-${Date.now()}`,
      fundId: params.fundId,
      callNumber: nextCallNumber,
      fundName: params.fundName,
      callDate: params.callDate ?? new Date().toISOString().split('T')[0],
      dueDate: params.dueDate,
      totalAmount: params.totalAmount,
      amountReceived: 0,
      lpCount: 0,
      lpsResponded: 0,
      status: 'draft',
      purpose: params.purpose,
    };

    return clone(upsertCapitalCall(next));
  }

  const result = await unwrapApiResult(
    apiClient.POST('/funds/{fundId}/capital-calls', {
      params: { path: { fundId: params.fundId } },
      body: {
        callNumber: 1,
        amount: params.totalAmount,
        dueDate: params.dueDate,
        purpose: params.purpose,
      } as never,
    }),
    { fallbackMessage: 'Failed to create capital call' }
  );

  return mapApiToCapitalCall(result as unknown as ApiCapitalCall, params.fundName);
}

export async function updateCapitalCall(
  capitalCallId: string,
  patch: Partial<CapitalCall>
): Promise<CapitalCall> {
  if (isMockMode('backOffice')) {
    const current = mockCapitalCalls.find((item) => item.id === capitalCallId);
    if (!current) {
      throw new Error(`Capital call not found: ${capitalCallId}`);
    }

    const updated: CapitalCall = {
      ...current,
      ...patch,
      id: current.id,
      fundId: current.fundId,
    };

    return clone(upsertCapitalCall(updated));
  }

  const call = mockCapitalCalls.find((item) => item.id === capitalCallId);
  if (!call) {
    throw new Error('Capital call update is not available until fund context is loaded.');
  }

  const result = await unwrapApiResult(
    apiClient.PUT('/funds/{fundId}/capital-calls/{id}', {
      params: { path: { fundId: call.fundId, id: capitalCallId } },
      body: {
        amount: patch.totalAmount,
        collected: patch.amountReceived,
        dueDate: patch.dueDate,
        purpose: patch.purpose,
      } as never,
    }),
    { fallbackMessage: 'Failed to update capital call' }
  );

  return mapApiToCapitalCall(result as unknown as ApiCapitalCall, call.fundName);
}

export async function sendCapitalCallToLPs(capitalCallId: string): Promise<CapitalCall> {
  return updateCapitalCall(capitalCallId, { status: 'sent' });
}

export async function sendCapitalCallReminder(capitalCallId: string): Promise<CapitalCall> {
  const call = mockCapitalCalls.find((item) => item.id === capitalCallId);
  if (!call) {
    throw new Error(`Capital call not found: ${capitalCallId}`);
  }

  return clone(call);
}

export async function getDistributions(fundId?: string): Promise<Distribution[]> {
  const values = fundId
    ? mockDistributions.filter((distribution) => distribution.fundId === fundId)
    : mockDistributions;
  return clone(values);
}

export async function getLPResponses(fundId?: string): Promise<LPResponse[]> {
  if (isMockMode('backOffice')) {
    const responses = fundId
      ? mockLPResponses.filter((response) => response.fundId === fundId)
      : mockLPResponses;
    return clone(responses);
  }

  if (!fundId) {
    return clone(mockLPResponses);
  }

  return clone(mockLPResponses.filter((response) => response.fundId === fundId));
}

export async function sendLPReminder(lpResponseId: string): Promise<LPResponse> {
  const response = mockLPResponses.find((item) => item.id === lpResponseId);
  if (!response) {
    throw new Error(`LP response not found: ${lpResponseId}`);
  }

  return clone(response);
}

export async function recordLPResponsePayment(
  lpResponseId: string,
  amountPaid: number
): Promise<LPResponse> {
  const response = mockLPResponses.find((item) => item.id === lpResponseId);
  if (!response) {
    throw new Error(`LP response not found: ${lpResponseId}`);
  }

  const updated: LPResponse = {
    ...response,
    amountPaid,
    status: amountPaid <= 0
      ? 'pending'
      : amountPaid >= response.callAmount
        ? 'paid'
        : 'partial',
  };

  return clone(upsertLPResponse(updated));
}

export async function exportFundAdminActivity(): Promise<{ exportedAt: string }> {
  return {
    exportedAt: new Date().toISOString(),
  };
}
