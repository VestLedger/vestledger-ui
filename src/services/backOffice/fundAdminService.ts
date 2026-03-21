import { isMockMode } from "@/config/data-mode";
import {
  mockCapitalCalls as seedCapitalCalls,
  mockDistributions as seedDistributions,
  mockLPResponses as seedLPResponses,
  type CapitalCall,
  type Distribution,
  type LPResponse,
} from "@/data/seeds/back-office/fund-admin";
import { mockFunds as seedFunds } from "@/data/seeds/funds";
import { apiClient } from "@/api/client";
import { unwrapApiResult } from "@/api/unwrap";

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
  return seedFunds.find((fund) => fund.id === fundId)?.name ?? "Unknown Fund";
}

function mapApiToCapitalCall(
  api: ApiCapitalCall,
  fundName: string,
): CapitalCall {
  const statusMap: Record<string, CapitalCall["status"]> = {
    pending: "sent",
    partial: "in-progress",
    complete: "completed",
    overdue: "in-progress",
  };

  return {
    id: api.id,
    fundId: api.fundId,
    callNumber: api.callNumber,
    fundName,
    callDate: api.createdAt.split("T")[0],
    dueDate: api.dueDate.split("T")[0],
    totalAmount: api.amount,
    amountReceived: api.collected,
    lpCount: 0,
    lpsResponded: 0,
    status: statusMap[api.status] ?? "draft",
    purpose: api.purpose ?? "",
  };
}

function upsertCapitalCall(value: CapitalCall): CapitalCall {
  const index = seedCapitalCalls.findIndex((item) => item.id === value.id);
  if (index === -1) {
    seedCapitalCalls.unshift(value);
    return value;
  }
  seedCapitalCalls[index] = value;
  return value;
}

function upsertLPResponse(value: LPResponse): LPResponse {
  const index = seedLPResponses.findIndex((item) => item.id === value.id);
  if (index === -1) {
    seedLPResponses.unshift(value);
    return value;
  }
  seedLPResponses[index] = value;
  return value;
}

export async function getCapitalCalls(fundId?: string): Promise<CapitalCall[]> {
  if (isMockMode("backOffice")) {
    const calls = fundId
      ? seedCapitalCalls.filter((call) => call.fundId === fundId)
      : seedCapitalCalls;
    return clone(calls);
  }

  if (!fundId) {
    const result = await unwrapApiResult(
      apiClient.GET("/capital-calls/active"),
      { fallbackMessage: "Failed to fetch active capital calls" },
    );
    return (
      (result as unknown as (ApiCapitalCall & { fund?: { name: string } })[]) ??
      []
    ).map((cc) =>
      mapApiToCapitalCall(cc, cc.fund?.name ?? getFundName(cc.fundId)),
    );
  }

  const result = await unwrapApiResult(
    apiClient.GET("/funds/{fundId}/capital-calls", {
      params: { path: { fundId } },
    }),
    { fallbackMessage: "Failed to fetch capital calls" },
  );

  const list = Array.isArray(result)
    ? result
    : ((result as unknown as { data?: unknown[] })?.data ?? []);
  return ((list as unknown as ApiCapitalCall[]) ?? []).map((cc) =>
    mapApiToCapitalCall(cc, getFundName(cc.fundId || fundId)),
  );
}

export async function createCapitalCall(
  params: CreateCapitalCallParams,
): Promise<CapitalCall> {
  if (isMockMode("backOffice")) {
    const nextCallNumber =
      Math.max(0, ...seedCapitalCalls.map((call) => call.callNumber)) + 1;
    const next: CapitalCall = {
      id: `call-${Date.now()}`,
      fundId: params.fundId,
      callNumber: nextCallNumber,
      fundName: params.fundName,
      callDate: params.callDate ?? new Date().toISOString().split("T")[0],
      dueDate: params.dueDate,
      totalAmount: params.totalAmount,
      amountReceived: 0,
      lpCount: 0,
      lpsResponded: 0,
      status: "draft",
      purpose: params.purpose,
    };

    return clone(upsertCapitalCall(next));
  }

  const result = await unwrapApiResult(
    apiClient.POST("/funds/{fundId}/capital-calls", {
      params: { path: { fundId: params.fundId } },
      body: {
        callNumber: 1,
        amount: params.totalAmount,
        dueDate: params.dueDate,
        purpose: params.purpose,
      } as never,
    }),
    { fallbackMessage: "Failed to create capital call" },
  );

  return mapApiToCapitalCall(
    result as unknown as ApiCapitalCall,
    params.fundName,
  );
}

export async function updateCapitalCall(
  capitalCallId: string,
  patch: Partial<CapitalCall>,
): Promise<CapitalCall> {
  if (isMockMode("backOffice")) {
    const current = seedCapitalCalls.find((item) => item.id === capitalCallId);
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

  const call = seedCapitalCalls.find((item) => item.id === capitalCallId);
  if (!call) {
    throw new Error(
      "Capital call update is not available until fund context is loaded.",
    );
  }

  const result = await unwrapApiResult(
    apiClient.PUT("/funds/{fundId}/capital-calls/{id}", {
      params: { path: { fundId: call.fundId, id: capitalCallId } },
      body: {
        amount: patch.totalAmount,
        collected: patch.amountReceived,
        dueDate: patch.dueDate,
        purpose: patch.purpose,
      } as never,
    }),
    { fallbackMessage: "Failed to update capital call" },
  );

  return mapApiToCapitalCall(
    result as unknown as ApiCapitalCall,
    call.fundName,
  );
}

export async function sendCapitalCallToLPs(
  capitalCallId: string,
): Promise<CapitalCall> {
  return updateCapitalCall(capitalCallId, { status: "sent" });
}

export async function sendCapitalCallReminder(
  capitalCallId: string,
): Promise<CapitalCall> {
  if (isMockMode("backOffice")) {
    const call = seedCapitalCalls.find((item) => item.id === capitalCallId);
    if (!call) throw new Error(`Capital call not found: ${capitalCallId}`);
    return clone(call);
  }

  const result = await unwrapApiResult(
    apiClient.POST(
      "/capital-calls/{id}/remind" as never,
      {
        params: { path: { id: capitalCallId } },
      } as never,
    ),
    { fallbackMessage: "Failed to send capital call reminder" },
  );
  return mapApiToCapitalCall(result as unknown as ApiCapitalCall, "");
}

export async function getDistributions(
  fundId?: string,
): Promise<Distribution[]> {
  if (isMockMode("backOffice")) {
    const values = fundId
      ? seedDistributions.filter(
          (distribution) => distribution.fundId === fundId,
        )
      : seedDistributions;
    return clone(values);
  }

  const result = await unwrapApiResult(
    fundId
      ? apiClient.GET(
          "/funds/{fundId}/distributions" as never,
          { params: { path: { fundId } } } as never,
        )
      : apiClient.GET("/distributions" as never),
    { fallbackMessage: "Failed to load distributions" },
  );
  const list = Array.isArray(result)
    ? result
    : ((result as unknown as { data?: unknown[] })?.data ?? []);
  return list as Distribution[];
}

export async function getLPResponses(fundId?: string): Promise<LPResponse[]> {
  if (isMockMode("backOffice")) {
    const responses = fundId
      ? seedLPResponses.filter((response) => response.fundId === fundId)
      : seedLPResponses;
    return clone(responses);
  }

  if (!fundId) {
    return clone(seedLPResponses);
  }

  return clone(
    seedLPResponses.filter((response) => response.fundId === fundId),
  );
}

export async function sendLPReminder(
  lpResponseId: string,
): Promise<LPResponse> {
  const response = seedLPResponses.find((item) => item.id === lpResponseId);
  if (!response) {
    throw new Error(`LP response not found: ${lpResponseId}`);
  }

  return clone(response);
}

export async function recordLPResponsePayment(
  lpResponseId: string,
  amountPaid: number,
): Promise<LPResponse> {
  const response = seedLPResponses.find((item) => item.id === lpResponseId);
  if (!response) {
    throw new Error(`LP response not found: ${lpResponseId}`);
  }

  const updated: LPResponse = {
    ...response,
    amountPaid,
    status:
      amountPaid <= 0
        ? "pending"
        : amountPaid >= response.callAmount
          ? "paid"
          : "partial",
  };

  return clone(upsertLPResponse(updated));
}

export async function exportFundAdminActivity(): Promise<{
  exportedAt: string;
}> {
  return {
    exportedAt: new Date().toISOString(),
  };
}
