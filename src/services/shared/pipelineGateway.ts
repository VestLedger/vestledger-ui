import type { GetPipelineParams } from '@/store/slices/pipelineSlice';
import type { PipelineDeal, PipelineDealOutcome } from '@/data/mocks/pipeline';
import { requestJson, type ApiQueryParams } from './httpClient';

export interface PipelineApiDeal {
  id: string;
  name: string;
  stage: string;
  outcome?: string;
  sector: string;
  amount: number;
  probability: number;
  founder: string;
  lastContact?: string | null;
  fundId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePipelineDealApiInput {
  name: string;
  stage: string;
  sector: string;
  amount: number;
  probability: number;
  founder: string;
  outcome?: PipelineDealOutcome;
  fundId?: string | null;
}

export interface UpdatePipelineDealApiInput {
  stage?: string;
  probability?: number;
  outcome?: PipelineDealOutcome;
  amount?: number;
  founder?: string;
  fundId?: string | null;
}

type PipelineDealsResponse =
  | PipelineApiDeal[]
  | {
      data?: PipelineApiDeal[];
    };

const VALID_OUTCOMES: ReadonlySet<PipelineDealOutcome> = new Set<PipelineDealOutcome>([
  'active',
  'won',
  'lost',
  'withdrawn',
  'passed',
]);

const DEFAULT_STAGES = [
  'Sourced',
  'First Meeting',
  'Due Diligence',
  'Term Sheet',
  'Closed',
];

function toQuery(params: GetPipelineParams): ApiQueryParams {
  return {
    stage: params.stageFilter,
    fundId: params.fundId,
    search: params.search,
    limit: params.limit,
    offset: params.offset,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  };
}

function normalizeOutcome(value?: string | null): PipelineDealOutcome {
  if (value && VALID_OUTCOMES.has(value as PipelineDealOutcome)) {
    return value as PipelineDealOutcome;
  }
  return 'active';
}

export function formatAmountToMillions(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? Math.max(amount, 0) : 0;
  const millions = safeAmount / 1_000_000;
  const digits = millions >= 10 ? 0 : 1;
  return `$${millions.toFixed(digits)}M`;
}

export function formatRelativeTimestamp(value?: string | null): string {
  if (!value) return 'No recent contact';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths <= 1) return '1 month ago';
  return `${diffMonths} months ago`;
}

export function mapPipelineApiDealToPipelineDeal(apiDeal: PipelineApiDeal): PipelineDeal {
  return {
    id: apiDeal.id,
    name: apiDeal.name,
    stage: apiDeal.stage,
    outcome: normalizeOutcome(apiDeal.outcome),
    sector: apiDeal.sector,
    amount: formatAmountToMillions(apiDeal.amount),
    probability: Math.round(apiDeal.probability ?? 0),
    founder: apiDeal.founder,
    lastContact: formatRelativeTimestamp(apiDeal.lastContact ?? apiDeal.updatedAt ?? apiDeal.createdAt),
  };
}

export async function fetchPipelineDealsFromApi(
  params: GetPipelineParams = {}
): Promise<PipelineApiDeal[]> {
  const response = await requestJson<PipelineDealsResponse>('/pipeline/deals', {
    method: 'GET',
    query: toQuery(params),
    fallbackMessage: 'Failed to load pipeline deals',
  });

  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

export async function fetchPipelineStagesFromApi(): Promise<string[]> {
  const stages = await requestJson<string[]>('/pipeline/stages', {
    method: 'GET',
    fallbackMessage: 'Failed to load pipeline stages',
  });

  if (!Array.isArray(stages) || stages.length === 0) {
    return DEFAULT_STAGES;
  }

  return stages;
}

export async function createPipelineDealInApi(
  input: CreatePipelineDealApiInput
): Promise<PipelineApiDeal> {
  return requestJson<PipelineApiDeal>('/pipeline/deals', {
    method: 'POST',
    body: input,
    fallbackMessage: 'Failed to create pipeline deal',
  });
}

export async function updatePipelineDealInApi(
  dealId: string,
  input: UpdatePipelineDealApiInput
): Promise<PipelineApiDeal> {
  return requestJson<PipelineApiDeal>(`/pipeline/deals/${dealId}`, {
    method: 'PATCH',
    body: input,
    fallbackMessage: 'Failed to update pipeline deal',
  });
}
