export interface ReportTemplate {
  id: string;
  name: string;
  type: 'quarterly' | 'annual' | 'custom' | 'monthly';
  description: string;
  format: 'pdf' | 'excel' | 'csv' | 'ppt';
  sections: string[];
  estimatedPages?: number;
}

export interface ExportJob {
  id: string;
  reportName: string;
  format: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  downloadUrl?: string;
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Quarterly LP Report',
    type: 'quarterly',
    description:
      'Comprehensive quarterly report for Limited Partners with fund performance, portfolio updates, and financial statements',
    format: 'pdf',
    sections: ['Executive Summary', 'Fund Performance', 'Portfolio Companies', 'Financials', 'Pipeline'],
    estimatedPages: 25,
  },
  {
    id: '2',
    name: 'Annual Fund Report',
    type: 'annual',
    description:
      'Complete annual overview including full year performance, all portfolio activity, and detailed analytics',
    format: 'pdf',
    sections: ['Year in Review', 'Performance Metrics', 'Portfolio Deep Dive', 'Market Analysis', 'Looking Ahead'],
    estimatedPages: 50,
  },
  {
    id: '3',
    name: 'Portfolio Dashboard Export',
    type: 'custom',
    description: 'Export current portfolio data including metrics, valuations, and company details',
    format: 'excel',
    sections: ['Company List', 'Metrics', 'Valuations', 'Ownership', 'Returns'],
  },
  {
    id: '4',
    name: 'Deal Pipeline Report',
    type: 'custom',
    description: 'Current dealflow pipeline with company details, stages, and scoring',
    format: 'excel',
    sections: ['Active Deals', 'Sourcing', 'Due Diligence', 'Scoring'],
  },
  {
    id: '5',
    name: 'Fund Performance Deck',
    type: 'quarterly',
    description: 'Presentation-ready performance deck for board meetings and LP updates',
    format: 'ppt',
    sections: ['Key Metrics', 'Portfolio Highlights', 'Recent Activity', 'Market Insights'],
    estimatedPages: 15,
  },
  {
    id: '6',
    name: 'Cap Table Export',
    type: 'custom',
    description: 'Detailed capitalization table with all shareholders, share classes, and ownership percentages',
    format: 'excel',
    sections: ['Shareholders', 'Share Classes', 'Vesting', 'Dilution Analysis'],
  },
];

export const mockExportJobs: ExportJob[] = [
  {
    id: '1',
    reportName: 'Q3 2024 LP Report',
    format: 'PDF',
    status: 'completed',
    progress: 100,
    createdAt: '2024-11-28T14:30:00',
    downloadUrl: '#',
  },
  {
    id: '2',
    reportName: 'Portfolio Dashboard',
    format: 'Excel',
    status: 'completed',
    progress: 100,
    createdAt: '2024-11-27T10:15:00',
    downloadUrl: '#',
  },
  {
    id: '3',
    reportName: 'Deal Pipeline Report',
    format: 'Excel',
    status: 'processing',
    progress: 65,
    createdAt: '2024-11-28T16:45:00',
  },
];

