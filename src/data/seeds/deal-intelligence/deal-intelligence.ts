import type { LucideIcon } from 'lucide-react';
import { BarChart, DollarSign, FileText, TrendingUp, Users } from 'lucide-react';

export type DocumentCategory = 'financial' | 'legal' | 'market' | 'team' | 'technical';

export type DocumentStatus = 'completed' | 'in-progress' | 'pending' | 'overdue';
export type ICStatus = 'ready-for-ic' | 'dd-in-progress' | 'docs-overdue' | 'blocked';

export interface CategoryProgress {
  category: DocumentCategory;
  completed: number;
  total: number;
  status: 'completed' | 'in-progress' | 'overdue';
}

export interface ActiveDeal {
  id: number;
  name: string;
  stage: string;
  sector: string;
  amount: string;
  founder: string;
  progress: number;
  docsCount: number;
  icStatus: ICStatus;
  categoryProgress: CategoryProgress[];
}

export interface Document {
  id: number;
  name: string;
  category: DocumentCategory;
  status: DocumentStatus;
  dealId: number;
  dealName: string;
  uploadedBy?: string;
  uploadedDate?: string;
  size?: string;
}

export interface FundAnalytics {
  dealFlowMetrics: {
    activeDeals: number;
    avgTimeInDD: number; // days
    ddToICConversionRate: number; // percentage
    readyForIC: number;
  };
  dealDistribution: {
    byStage: { stage: string; count: number }[];
    bySector: { sector: string; count: number }[];
    bySize: { range: string; count: number }[];
  };
  ddProgress: {
    avgCompletion: number; // percentage
    onTrack: number;
    atRisk: number;
    blocked: number;
  };
}

export interface DealAnalytics {
  dealId: number;
  financial: {
    revenue: {
      arr: number;
      mrr: number;
      growthRateMoM: number;
      growthRateYoY: number;
    };
    efficiency: {
      burnRate: number;
      runway: number; // months
      cac: number;
      ltv: number;
      ltvCacRatio: number;
    };
    unitEconomics: {
      grossMargin: number;
      contributionMargin: number;
      paybackPeriod: number; // months
    };
  };
  market: {
    marketSize: {
      tam: number; // in billions
      sam: number; // in billions
      som: number; // in millions
    };
    customers: {
      totalCustomers: number;
      nps: number;
      churnRate: number; // monthly %
      nrr: number; // net revenue retention %
    };
  };
  team: {
    size: number;
    founderExperienceScore: number; // 1-10
  };
}

export const activeDeals: ActiveDeal[] = [
  {
    id: 1,
    name: 'Quantum AI',
    stage: 'Series A',
    sector: 'AI/ML',
    amount: '$2.5M',
    founder: 'Sarah Chen',
    progress: 75,
    docsCount: 24,
    icStatus: 'dd-in-progress',
    categoryProgress: [
      { category: 'financial', completed: 5, total: 5, status: 'completed' },
      { category: 'market', completed: 3, total: 4, status: 'in-progress' },
      { category: 'legal', completed: 2, total: 3, status: 'in-progress' },
      { category: 'team', completed: 3, total: 3, status: 'completed' },
      { category: 'technical', completed: 1, total: 4, status: 'overdue' },
    ],
  },
  {
    id: 2,
    name: 'NeuroLink',
    stage: 'Seed',
    sector: 'MedTech',
    amount: '$1.2M',
    founder: 'Alex Martinez',
    progress: 45,
    docsCount: 18,
    icStatus: 'docs-overdue',
    categoryProgress: [
      { category: 'financial', completed: 3, total: 4, status: 'in-progress' },
      { category: 'market', completed: 2, total: 3, status: 'in-progress' },
      { category: 'legal', completed: 1, total: 3, status: 'overdue' },
      { category: 'team', completed: 2, total: 2, status: 'completed' },
      { category: 'technical', completed: 0, total: 3, status: 'overdue' },
    ],
  },
  {
    id: 3,
    name: 'CloudScale',
    stage: 'Series B',
    sector: 'SaaS',
    amount: '$5.0M',
    founder: 'Maria Rodriguez',
    progress: 90,
    docsCount: 31,
    icStatus: 'ready-for-ic',
    categoryProgress: [
      { category: 'financial', completed: 6, total: 6, status: 'completed' },
      { category: 'market', completed: 4, total: 4, status: 'completed' },
      { category: 'legal', completed: 4, total: 4, status: 'completed' },
      { category: 'team', completed: 3, total: 3, status: 'completed' },
      { category: 'technical', completed: 5, total: 5, status: 'completed' },
    ],
  },
];

export const mockDocuments: Document[] = [
  {
    id: 1,
    name: 'Financial Statements (2021-2024)',
    category: 'financial',
    status: 'completed',
    dealId: 1,
    dealName: 'Quantum AI',
    uploadedBy: 'Sarah Chen',
    uploadedDate: 'Nov 18, 2024',
    size: '2.4 MB',
  },
  {
    id: 2,
    name: 'Cap Table Analysis',
    category: 'financial',
    status: 'completed',
    dealId: 1,
    dealName: 'Quantum AI',
    uploadedBy: 'Mike Johnson',
    uploadedDate: 'Nov 19, 2024',
    size: '856 KB',
  },
  {
    id: 3,
    name: 'Market Size Report',
    category: 'market',
    status: 'completed',
    dealId: 1,
    dealName: 'Quantum AI',
    uploadedBy: 'Emma Davis',
    uploadedDate: 'Nov 17, 2024',
    size: '3.1 MB',
  },
  {
    id: 4,
    name: 'IP Portfolio Review',
    category: 'legal',
    status: 'in-progress',
    dealId: 1,
    dealName: 'Quantum AI',
    uploadedBy: 'Legal Team',
    uploadedDate: 'Nov 20, 2024',
    size: '1.2 MB',
  },
  {
    id: 5,
    name: 'Reference Call Notes',
    category: 'team',
    status: 'in-progress',
    dealId: 2,
    dealName: 'NeuroLink',
    uploadedBy: 'Alex Martinez',
    uploadedDate: 'Nov 21, 2024',
    size: '245 KB',
  },
  {
    id: 6,
    name: 'Technical Due Diligence Report',
    category: 'technical',
    status: 'overdue',
    dealId: 2,
    dealName: 'NeuroLink',
  },
  {
    id: 7,
    name: 'Competitive Analysis',
    category: 'market',
    status: 'completed',
    dealId: 3,
    dealName: 'CloudScale',
    uploadedBy: 'Strategy Team',
    uploadedDate: 'Nov 10, 2024',
    size: '1.9 MB',
  },
  {
    id: 8,
    name: 'Founder Background Check',
    category: 'team',
    status: 'completed',
    dealId: 3,
    dealName: 'CloudScale',
    uploadedBy: 'HR',
    uploadedDate: 'Nov 12, 2024',
    size: '456 KB',
  },
];

export const documentCategories: Array<{
  id: DocumentCategory;
  name: string;
  icon: LucideIcon;
  color: string;
}> = [
  { id: 'financial', name: 'Financial Analysis', icon: DollarSign, color: 'primary' },
  { id: 'market', name: 'Market Analysis', icon: BarChart, color: 'secondary' },
  { id: 'team', name: 'Team Assessment', icon: Users, color: 'accent' },
  { id: 'legal', name: 'Legal Review', icon: FileText, color: 'warning' },
  { id: 'technical', name: 'Technical DD', icon: TrendingUp, color: 'info' },
];

export const fundAnalytics: FundAnalytics = {
  dealFlowMetrics: {
    activeDeals: 8,
    avgTimeInDD: 23,
    ddToICConversionRate: 65,
    readyForIC: 2,
  },
  dealDistribution: {
    byStage: [
      { stage: 'Sourced', count: 2 },
      { stage: 'First Meeting', count: 2 },
      { stage: 'Due Diligence', count: 3 },
      { stage: 'Term Sheet', count: 1 },
    ],
    bySector: [
      { sector: 'AI/ML', count: 3 },
      { sector: 'Healthcare', count: 2 },
      { sector: 'FinTech', count: 2 },
      { sector: 'CleanTech', count: 1 },
    ],
    bySize: [
      { range: '<$2M', count: 3 },
      { range: '$2-4M', count: 4 },
      { range: '>$4M', count: 1 },
    ],
  },
  ddProgress: {
    avgCompletion: 68,
    onTrack: 5,
    atRisk: 2,
    blocked: 1,
  },
};

export const dealAnalyticsData: DealAnalytics[] = [
  {
    dealId: 1, // Quantum AI
    financial: {
      revenue: {
        arr: 2400000,
        mrr: 200000,
        growthRateMoM: 15,
        growthRateYoY: 180,
      },
      efficiency: {
        burnRate: 150000,
        runway: 18,
        cac: 850,
        ltv: 4200,
        ltvCacRatio: 4.9,
      },
      unitEconomics: {
        grossMargin: 78,
        contributionMargin: 65,
        paybackPeriod: 8,
      },
    },
    market: {
      marketSize: {
        tam: 50,
        sam: 8,
        som: 500,
      },
      customers: {
        totalCustomers: 1200,
        nps: 67,
        churnRate: 3.2,
        nrr: 118,
      },
    },
    team: {
      size: 24,
      founderExperienceScore: 8,
    },
  },
  {
    dealId: 2, // NeuroLink
    financial: {
      revenue: {
        arr: 800000,
        mrr: 67000,
        growthRateMoM: 12,
        growthRateYoY: 210,
      },
      efficiency: {
        burnRate: 95000,
        runway: 14,
        cac: 1200,
        ltv: 3800,
        ltvCacRatio: 3.2,
      },
      unitEconomics: {
        grossMargin: 72,
        contributionMargin: 58,
        paybackPeriod: 11,
      },
    },
    market: {
      marketSize: {
        tam: 35,
        sam: 5,
        som: 280,
      },
      customers: {
        totalCustomers: 450,
        nps: 71,
        churnRate: 4.1,
        nrr: 112,
      },
    },
    team: {
      size: 15,
      founderExperienceScore: 7,
    },
  },
  {
    dealId: 3, // CloudScale
    financial: {
      revenue: {
        arr: 5200000,
        mrr: 433000,
        growthRateMoM: 18,
        growthRateYoY: 240,
      },
      efficiency: {
        burnRate: 280000,
        runway: 22,
        cac: 650,
        ltv: 5800,
        ltvCacRatio: 8.9,
      },
      unitEconomics: {
        grossMargin: 85,
        contributionMargin: 72,
        paybackPeriod: 6,
      },
    },
    market: {
      marketSize: {
        tam: 120,
        sam: 18,
        som: 850,
      },
      customers: {
        totalCustomers: 2100,
        nps: 75,
        churnRate: 2.1,
        nrr: 125,
      },
    },
    team: {
      size: 42,
      founderExperienceScore: 9,
    },
  },
];

