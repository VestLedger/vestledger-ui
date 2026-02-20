export interface PitchDeckAnalysis {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'failed';
  summary?: {
    companyName: string;
    tagline: string;
    problem: string;
    solution: string;
    marketSize: {
      tam: string;
      sam: string;
      som: string;
    };
    businessModel: string;
    traction: string[];
    team: {
      founders: string[];
      keyHires: string[];
    };
    financials: {
      revenue: string;
      runway: string;
      askAmount: string;
    };
    competition: string[];
  };
  extractedData?: {
    slides: number;
    keyMetrics: { label: string; value: string }[];
  };
  aiInsights?: string[];
  redFlags?: string[];
  strengths?: string[];
}

export const mockAnalyses: PitchDeckAnalysis[] = [
  {
    id: 'pd-1',
    fileName: 'Quantum_AI_Deck_Nov2024.pdf',
    uploadDate: '2024-11-28',
    status: 'completed',
    summary: {
      companyName: 'Quantum AI',
      tagline: 'AI-powered quantum computing for enterprise',
      problem:
        'Enterprise companies struggle with complex optimization problems that classical computers cannot solve efficiently',
      solution: 'Quantum-classical hybrid AI platform that makes quantum computing accessible through simple APIs',
      marketSize: {
        tam: '$50B',
        sam: '$8B',
        som: '$500M',
      },
      businessModel: 'SaaS with usage-based pricing. $10k/month base + compute credits',
      traction: ['1,200 active customers', '$2.4M ARR', '15% MoM growth', '3 Fortune 500 pilots'],
      team: {
        founders: ['Sarah Chen (ex-Google Quantum AI)', 'Dr. Michael Zhang (MIT PhD Quantum Computing)'],
        keyHires: ['CTO from IBM Quantum', 'VP Sales from Snowflake'],
      },
      financials: {
        revenue: '$2.4M ARR',
        runway: '18 months',
        askAmount: '$2.5M Series A',
      },
      competition: ['IBM Quantum', 'Google Quantum AI', 'IonQ'],
    },
    extractedData: {
      slides: 18,
      keyMetrics: [
        { label: 'ARR', value: '$2.4M' },
        { label: 'Growth Rate', value: '15% MoM' },
        { label: 'Customers', value: '1,200' },
        { label: 'NPS', value: '67' },
        { label: 'Gross Margin', value: '78%' },
        { label: 'CAC', value: '$850' },
        { label: 'LTV', value: '$4,200' },
        { label: 'Burn Rate', value: '$150k/mo' },
      ],
    },
    aiInsights: [
      'Strong technical team with quantum computing expertise from leading institutions',
      'Clear product-market fit demonstrated by 15% MoM growth',
      'Compelling unit economics with 4.9x LTV:CAC ratio',
      'Enterprise traction with Fortune 500 pilots de-risks go-to-market',
    ],
    redFlags: [
      'Competitive landscape includes well-funded tech giants',
      'Quantum computing market still early/unproven',
      'Limited moat beyond technical expertise',
    ],
    strengths: ['World-class founding team', 'Strong revenue growth trajectory', 'Excellent gross margins for SaaS', 'Clear path to Series A metrics'],
  },
  {
    id: 'pd-2',
    fileName: 'NeuroLink_Pitch_2024.pdf',
    uploadDate: '2024-11-25',
    status: 'completed',
    summary: {
      companyName: 'NeuroLink',
      tagline: 'AI-powered brain-computer interface for medical applications',
      problem: 'Paralysis patients lack effective communication and mobility solutions',
      solution: 'Non-invasive BCI that translates brain signals into digital commands',
      marketSize: {
        tam: '$35B',
        sam: '$5B',
        som: '$280M',
      },
      businessModel: 'Device sales + recurring software subscription',
      traction: ['450 beta users', '$800k ARR', '12% MoM growth', 'FDA breakthrough device designation'],
      team: {
        founders: ['Dr. Alex Martinez (Stanford Neuroscience)', 'Lisa Chen (ex-Neuralink Engineer)'],
        keyHires: ['VP Clinical from Medtronic'],
      },
      financials: {
        revenue: '$800k ARR',
        runway: '14 months',
        askAmount: '$1.2M Seed',
      },
      competition: ['Neuralink', 'Synchron', 'Paradromics'],
    },
    extractedData: {
      slides: 15,
      keyMetrics: [
        { label: 'ARR', value: '$800k' },
        { label: 'Growth Rate', value: '12% MoM' },
        { label: 'Beta Users', value: '450' },
        { label: 'NPS', value: '71' },
      ],
    },
    aiInsights: [
      'FDA breakthrough designation significantly de-risks regulatory path',
      'Strong clinical validation with 450 beta users',
      'Founding team combines deep technical + clinical expertise',
    ],
    redFlags: [
      'Long regulatory timeline typical for medical devices',
      'High customer acquisition cost in medical device market',
      'Competing against well-funded players (Neuralink)',
    ],
    strengths: ['FDA breakthrough designation', 'Non-invasive approach (competitive advantage)', 'Clinical traction with beta users'],
  },
];

