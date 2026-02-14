import { Building2, FileText, Search, TrendingUp, Users } from 'lucide-react';
import { isMockMode } from '@/config/data-mode';
import {
  getMockTopbarSearchResults,
  type TopbarSearchResult,
} from '@/data/mocks/topbar/search';
import { requestJson } from '@/services/shared/httpClient';

type ApiPipelineDeal = {
  id: string;
  name: string;
  stage?: string;
  sector?: string;
  amount?: number;
};

type ApiContact = {
  id: string;
  name: string;
  email?: string;
  company?: string;
  role?: string;
};

type ApiDocument = {
  id: string;
  name: string;
  category?: string;
  uploadedDate?: string;
};

type ApiFund = {
  id: string;
  name: string;
  displayName?: string;
  strategy?: string;
  status?: string;
};

type ApiListResponse<T> = {
  data?: T[];
  meta?: unknown;
};

type ApiDocumentsResponse = {
  documents?: ApiDocument[];
  folders?: unknown[];
};

const MAX_RESULTS = 8;

function formatCurrencyCompact(value?: number): string | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;

  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatUploadedDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function safeRequest<T>(
  path: string,
  query: Record<string, string | number | undefined>
): Promise<T | null> {
  try {
    return await requestJson<T>(path, {
      method: 'GET',
      query,
    });
  } catch {
    return null;
  }
}

function dedupeResults(results: TopbarSearchResult[]): TopbarSearchResult[] {
  const seenKeys = new Set<string>();
  const unique: TopbarSearchResult[] = [];

  for (const result of results) {
    const key = `${result.type}:${result.title.toLowerCase()}:${result.href ?? ''}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    unique.push(result);
  }

  return unique;
}

export async function searchTopbar(query: string): Promise<TopbarSearchResult[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  if (isMockMode('search')) {
    return getMockTopbarSearchResults(trimmedQuery);
  }

  const [pipelineResponse, contactsResponse, documentsResponse, fundsResponse] =
    await Promise.all([
      safeRequest<ApiListResponse<ApiPipelineDeal>>('/pipeline/deals', {
        search: trimmedQuery,
        limit: 4,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
      safeRequest<ApiListResponse<ApiContact>>('/contacts', {
        search: trimmedQuery,
        limit: 4,
        sortBy: 'lastContact',
        sortOrder: 'desc',
      }),
      safeRequest<ApiDocumentsResponse>('/documents', {
        search: trimmedQuery,
        limit: 4,
        sortBy: 'uploadedDate',
        sortOrder: 'desc',
      }),
      safeRequest<ApiListResponse<ApiFund>>('/funds', {
        search: trimmedQuery,
        limit: 3,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
    ]);

  const mappedResults: TopbarSearchResult[] = [];

  const deals = pipelineResponse?.data ?? [];
  for (const deal of deals) {
    const amount = formatCurrencyCompact(deal.amount);
    const descriptionParts = [amount, deal.sector, deal.stage].filter(Boolean);

    mappedResults.push({
      id: `deal-${deal.id}`,
      type: 'deal',
      title: deal.name,
      description: descriptionParts.length > 0 ? descriptionParts.join(' • ') : 'Pipeline deal',
      category: 'Pipeline',
      icon: TrendingUp,
      href: '/pipeline',
    });
  }

  const contacts = contactsResponse?.data ?? [];
  for (const contact of contacts) {
    mappedResults.push({
      id: `contact-${contact.id}`,
      type: 'contact',
      title: contact.name,
      description: [contact.company, contact.email].filter(Boolean).join(' • ') || contact.role || 'Contact',
      category: 'Contacts',
      icon: Users,
      href: '/contacts',
    });
  }

  const documents = documentsResponse?.documents ?? [];
  for (const document of documents) {
    mappedResults.push({
      id: `document-${document.id}`,
      type: 'document',
      title: document.name,
      description: [document.category, formatUploadedDate(document.uploadedDate)].filter(Boolean).join(' • ') || 'Document',
      category: 'Documents',
      icon: FileText,
      href: '/documents',
    });
  }

  const funds = fundsResponse?.data ?? [];
  for (const fund of funds) {
    mappedResults.push({
      id: `fund-${fund.id}`,
      type: 'company',
      title: fund.displayName ?? fund.name,
      description: [fund.strategy, fund.status].filter(Boolean).join(' • ') || 'Fund',
      category: 'Funds',
      icon: Building2,
      href: '/analytics',
    });
  }

  const aiAndActions = getMockTopbarSearchResults(trimmedQuery).filter(
    (result) => result.type === 'ai-suggestion' || result.type === 'action'
  );

  const merged = dedupeResults([...aiAndActions, ...mappedResults]);
  if (merged.length > 0) {
    return merged.slice(0, MAX_RESULTS);
  }

  return [
    {
      id: 'fallback-search',
      type: 'action',
      title: `Search for "${trimmedQuery}"`,
      description: 'Open global search experience',
      category: 'Search',
      icon: Search,
      href: '/home',
    },
  ];
}

export type { TopbarSearchResult };
