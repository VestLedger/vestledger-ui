import { Sparkles, TrendingUp, FileText, Building2, DollarSign, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TopbarSearchResultType = 'deal' | 'company' | 'document' | 'contact' | 'action' | 'ai-suggestion';

export interface TopbarSearchResult {
  id: string;
  type: TopbarSearchResultType;
  title: string;
  description?: string;
  category?: string;
  confidence?: number;
  icon?: LucideIcon;
  href?: string;
}

export const getMockTopbarSearchResults = (searchQuery: string): TopbarSearchResult[] => {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return [];

  const results: TopbarSearchResult[] = [];

  // Natural language detection
  if (query.includes('show') || query.includes('find') || query.includes('get')) {
    if (query.includes('deal') || query.includes('pipeline')) {
      results.push({
        id: 'ai-1',
        type: 'ai-suggestion',
        title: 'Navigate to Deal Pipeline',
        description: 'AI detected: You want to view deals',
        confidence: 0.95,
        icon: Sparkles,
        href: '/pipeline',
      });
    }
    if (query.includes('portfolio') || query.includes('companies')) {
      results.push({
        id: 'ai-2',
        type: 'ai-suggestion',
        title: 'Navigate to Portfolio',
        description: 'AI detected: You want to view portfolio companies',
        confidence: 0.92,
        icon: Sparkles,
        href: '/portfolio',
      });
    }
    if (query.includes('report') || query.includes('analytics')) {
      results.push({
        id: 'ai-3',
        type: 'ai-suggestion',
        title: 'Navigate to Analytics',
        description: 'AI detected: You want to view reports or analytics',
        confidence: 0.88,
        icon: Sparkles,
        href: '/analytics',
      });
    }
  }

  // Mock deal results
  if (query.includes('quantum') || query.includes('ai') || query.includes('series')) {
    results.push({
      id: 'deal-1',
      type: 'deal',
      title: 'Quantum AI - Series A',
      description: '$5M • SaaS • 85% probability',
      category: 'Active Deal',
      icon: TrendingUp,
    });
  }

  // Mock company results
  if (query.includes('data') || query.includes('sync')) {
    results.push({
      id: 'company-1',
      type: 'company',
      title: 'DataSync Pro',
      description: 'Series B • Portfolio Company',
      category: 'Portfolio',
      icon: Building2,
    });
  }

  // Mock document results
  if (query.includes('dd') || query.includes('due diligence') || query.includes('doc')) {
    results.push({
      id: 'doc-1',
      type: 'document',
      title: 'Due Diligence Checklist - Quantum AI',
      description: 'Updated 2 days ago',
      category: 'Document',
      icon: FileText,
    });
  }

  // AI quick actions
  if (query.includes('create') || query.includes('new') || query.includes('add')) {
    results.push({
      id: 'action-1',
      type: 'action',
      title: 'Create New Deal',
      description: 'Quick action',
      icon: DollarSign,
      href: '/pipeline?action=create',
    });
  }

  // Time-based queries
  if (query.includes('today') || query.includes('this week') || query.includes('recent')) {
    results.push({
      id: 'ai-4',
      type: 'ai-suggestion',
      title: 'Recent Activity',
      description: 'Show deals and updates from the past week',
      confidence: 0.9,
      icon: Clock,
      href: '/dashboard',
    });
  }

  return results.slice(0, 6);
};

