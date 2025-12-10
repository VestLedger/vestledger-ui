'use client';

import { useState } from 'react';
import { Card, Button, Badge, Input, Progress } from '@/ui';
import { 
  Search, 
  Sparkles, 
  Building2, 
  MapPin, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  ExternalLink,
  Filter,
  Star,
  Zap,
  Target,
  Calendar,
  Globe,
  Briefcase
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  subIndustry: string;
  location: string;
  founded: number;
  employees: string;
  funding: {
    total: number;
    lastRound: string;
    lastRoundAmount: number;
    lastRoundDate: string;
  };
  metrics: {
    revenue?: number;
    growth?: number;
    customers?: number;
  };
  aiMatchScore: number;
  aiReasoning: string;
  status?: 'new' | 'in_pipeline' | 'contacted';
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'NeuralFlow AI',
    description: 'Enterprise AI platform for automated document processing and workflow optimization',
    industry: 'Artificial Intelligence',
    subIndustry: 'Enterprise Software',
    location: 'San Francisco, CA',
    founded: 2021,
    employees: '50-100',
    funding: {
      total: 12_000_000,
      lastRound: 'Series A',
      lastRoundAmount: 10_000_000,
      lastRoundDate: '2023-09',
    },
    metrics: {
      revenue: 2_400_000,
      growth: 180,
      customers: 45,
    },
    aiMatchScore: 94,
    aiReasoning: 'Strong alignment with AI/ML thesis. Exceptional revenue growth (180% YoY). Enterprise focus matches portfolio strategy. Founders have prior exits.',
    status: 'new',
  },
  {
    id: '2',
    name: 'ClimateTech Solutions',
    description: 'Carbon accounting and ESG reporting platform for Fortune 500 companies',
    industry: 'CleanTech',
    subIndustry: 'Sustainability',
    location: 'Boston, MA',
    founded: 2020,
    employees: '100-200',
    funding: {
      total: 25_000_000,
      lastRound: 'Series B',
      lastRoundAmount: 18_000_000,
      lastRoundDate: '2024-01',
    },
    metrics: {
      revenue: 5_800_000,
      growth: 120,
      customers: 85,
    },
    aiMatchScore: 87,
    aiReasoning: 'ESG tailwinds strong. Large enterprise customer base. May be slightly outside core thesis but strategic for LP relations.',
    status: 'new',
  },
  {
    id: '3',
    name: 'SecureAuth Pro',
    description: 'Zero-trust identity and access management for distributed enterprises',
    industry: 'Cybersecurity',
    subIndustry: 'Identity Management',
    location: 'Austin, TX',
    founded: 2022,
    employees: '25-50',
    funding: {
      total: 8_000_000,
      lastRound: 'Seed',
      lastRoundAmount: 5_000_000,
      lastRoundDate: '2023-06',
    },
    metrics: {
      revenue: 1_200_000,
      growth: 250,
      customers: 28,
    },
    aiMatchScore: 91,
    aiReasoning: 'Cybersecurity market timing excellent. Fastest growth in cohort. Technical team from Google/Meta. Seed stage aligns with Fund III mandate.',
    status: 'new',
  },
  {
    id: '4',
    name: 'PaymentStack',
    description: 'Embedded finance infrastructure for SaaS platforms',
    industry: 'FinTech',
    subIndustry: 'Payments',
    location: 'New York, NY',
    founded: 2021,
    employees: '50-100',
    funding: {
      total: 15_000_000,
      lastRound: 'Series A',
      lastRoundAmount: 12_000_000,
      lastRoundDate: '2023-11',
    },
    metrics: {
      revenue: 3_500_000,
      growth: 200,
      customers: 120,
    },
    aiMatchScore: 89,
    aiReasoning: 'Strong FinTech fit. High transaction volume growth. API-first approach. Competitive space but differentiated positioning.',
    status: 'contacted',
  },
];

const industries = ['All Industries', 'Artificial Intelligence', 'FinTech', 'CleanTech', 'Cybersecurity', 'HealthTech', 'Enterprise SaaS'];
const stages = ['All Stages', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+'];

export function CompanySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedStage, setSelectedStage] = useState('All Stages');
  const [showAIOnly, setShowAIOnly] = useState(true);

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'var(--app-success)';
    if (score >= 80) return 'var(--app-primary)';
    if (score >= 70) return 'var(--app-warning)';
    return 'var(--app-text-muted)';
  };

  const filteredCompanies = mockCompanies.filter(company => {
    if (searchQuery && !company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !company.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedIndustry !== 'All Industries' && company.industry !== selectedIndustry) return false;
    if (selectedStage !== 'All Stages' && company.funding.lastRound !== selectedStage) return false;
    return true;
  }).sort((a, b) => b.aiMatchScore - a.aiMatchScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Deal Sourcing</h2>
            <p className="text-sm text-[var(--app-text-muted)]">
              Discover companies matched to your investment thesis
            </p>
          </div>
        </div>
        <Badge variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
          <Zap className="w-3 h-3 mr-1" />
          {mockCompanies.length} AI-Matched Companies
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search companies, industries, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-[var(--app-text-muted)]" />}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-sm"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-sm"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <Button
              variant={showAIOnly ? 'solid' : 'bordered'}
              color={showAIOnly ? 'primary' : 'default'}
              size="sm"
              startContent={<Sparkles className="w-4 h-4" />}
              onPress={() => setShowAIOnly(!showAIOnly)}
            >
              AI Recommended
            </Button>
          </div>
        </div>
      </Card>

      {/* Company Cards */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredCompanies.map((company) => (
          <Card key={company.id} padding="lg" className="hover:border-[var(--app-primary)] transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--app-primary-bg)] to-[var(--app-surface)] flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[var(--app-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{company.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
                    <MapPin className="w-3 h-3" />
                    {company.location}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold"
                  style={{ color: getMatchScoreColor(company.aiMatchScore) }}
                >
                  {company.aiMatchScore}%
                </div>
                <div className="text-xs text-[var(--app-text-muted)]">AI Match</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[var(--app-text-muted)] mb-4 line-clamp-2">
              {company.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                {company.industry}
              </Badge>
              <Badge size="sm" variant="flat">
                {company.funding.lastRound}
              </Badge>
              <Badge size="sm" variant="flat">
                <Users className="w-3 h-3 mr-1" />
                {company.employees}
              </Badge>
              {company.status === 'contacted' && (
                <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
                  Contacted
                </Badge>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-[var(--app-surface-hover)]">
              <div className="text-center">
                <div className="text-lg font-semibold">{formatCurrency(company.funding.total)}</div>
                <div className="text-xs text-[var(--app-text-muted)]">Total Raised</div>
              </div>
              {company.metrics.revenue && (
                <div className="text-center">
                  <div className="text-lg font-semibold">{formatCurrency(company.metrics.revenue)}</div>
                  <div className="text-xs text-[var(--app-text-muted)]">ARR</div>
                </div>
              )}
              {company.metrics.growth && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-[var(--app-success)]">+{company.metrics.growth}%</div>
                  <div className="text-xs text-[var(--app-text-muted)]">YoY Growth</div>
                </div>
              )}
            </div>

            {/* AI Reasoning */}
            <div className="p-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-primary-bg)]/30 mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-primary)] mb-1">
                <Sparkles className="w-4 h-4" />
                AI Analysis
              </div>
              <p className="text-xs text-[var(--app-text-muted)]">{company.aiReasoning}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--app-border-subtle)]">
              <Button size="sm" variant="light" startContent={<ExternalLink className="w-3 h-3" />}>
                View Profile
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="bordered" isIconOnly>
                  <Star className="w-4 h-4" />
                </Button>
                <Button size="sm" color="primary" startContent={<Plus className="w-4 h-4" />}>
                  Add to Pipeline
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="bordered" size="lg">
          Load More Companies
        </Button>
      </div>
    </div>
  );
}
