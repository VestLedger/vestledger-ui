'use client'

import { useState } from 'react';
import { Card, Button, Badge, Progress } from '@/ui';
import { Upload, FileText, Sparkles, CheckCircle2, Clock, AlertCircle, Download, Eye } from 'lucide-react';

interface PitchDeckAnalysis {
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

const mockAnalyses: PitchDeckAnalysis[] = [
  {
    id: 'pd-1',
    fileName: 'Quantum_AI_Deck_Nov2024.pdf',
    uploadDate: '2024-11-28',
    status: 'completed',
    summary: {
      companyName: 'Quantum AI',
      tagline: 'AI-powered quantum computing for enterprise',
      problem: 'Enterprise companies struggle with complex optimization problems that classical computers cannot solve efficiently',
      solution: 'Quantum-classical hybrid AI platform that makes quantum computing accessible through simple APIs',
      marketSize: {
        tam: '$50B',
        sam: '$8B',
        som: '$500M'
      },
      businessModel: 'SaaS with usage-based pricing. $10k/month base + compute credits',
      traction: [
        '1,200 active customers',
        '$2.4M ARR',
        '15% MoM growth',
        '3 Fortune 500 pilots'
      ],
      team: {
        founders: ['Sarah Chen (ex-Google Quantum AI)', 'Dr. Michael Zhang (MIT PhD Quantum Computing)'],
        keyHires: ['CTO from IBM Quantum', 'VP Sales from Snowflake']
      },
      financials: {
        revenue: '$2.4M ARR',
        runway: '18 months',
        askAmount: '$2.5M Series A'
      },
      competition: ['IBM Quantum', 'Google Quantum AI', 'IonQ']
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
        { label: 'Burn Rate', value: '$150k/mo' }
      ]
    },
    aiInsights: [
      'Strong technical team with quantum computing expertise from leading institutions',
      'Clear product-market fit demonstrated by 15% MoM growth',
      'Compelling unit economics with 4.9x LTV:CAC ratio',
      'Enterprise traction with Fortune 500 pilots de-risks go-to-market'
    ],
    redFlags: [
      'Competitive landscape includes well-funded tech giants',
      'Quantum computing market still early/unproven',
      'Limited moat beyond technical expertise'
    ],
    strengths: [
      'World-class founding team',
      'Strong revenue growth trajectory',
      'Excellent gross margins for SaaS',
      'Clear path to Series A metrics'
    ]
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
        som: '$280M'
      },
      businessModel: 'Device sales + recurring software subscription',
      traction: [
        '450 beta users',
        '$800k ARR',
        '12% MoM growth',
        'FDA breakthrough device designation'
      ],
      team: {
        founders: ['Dr. Alex Martinez (Stanford Neuroscience)', 'Lisa Chen (ex-Neuralink Engineer)'],
        keyHires: ['VP Clinical from Medtronic']
      },
      financials: {
        revenue: '$800k ARR',
        runway: '14 months',
        askAmount: '$1.2M Seed'
      },
      competition: ['Neuralink', 'Synchron', 'Paradromics']
    },
    extractedData: {
      slides: 15,
      keyMetrics: [
        { label: 'ARR', value: '$800k' },
        { label: 'Growth Rate', value: '12% MoM' },
        { label: 'Beta Users', value: '450' },
        { label: 'NPS', value: '71' }
      ]
    },
    aiInsights: [
      'FDA breakthrough designation significantly de-risks regulatory path',
      'Strong clinical validation with 450 beta users',
      'Founding team combines deep technical + clinical expertise'
    ],
    redFlags: [
      'Long regulatory timeline typical for medical devices',
      'High customer acquisition cost in medical device market',
      'Competing against well-funded players (Neuralink)'
    ],
    strengths: [
      'FDA breakthrough designation',
      'Non-invasive approach (competitive advantage)',
      'Clinical traction with beta users'
    ]
  }
];

export function PitchDeckReader() {
  const [analyses, setAnalyses] = useState<PitchDeckAnalysis[]>(mockAnalyses);
  const [selectedAnalysis, setSelectedAnalysis] = useState<PitchDeckAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      // In real implementation, this would trigger file upload and AI analysis
    }, 2000);
  };

  const getStatusIcon = (status: PitchDeckAnalysis['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-[var(--app-success)]" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-[var(--app-warning)]" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-[var(--app-danger)]" />;
    }
  };

  const getStatusBadge = (status: PitchDeckAnalysis['status']) => {
    switch (status) {
      case 'completed':
        return <Badge size="sm" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">Completed</Badge>;
      case 'processing':
        return <Badge size="sm" className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]">Processing</Badge>;
      case 'failed':
        return <Badge size="sm" className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]">Failed</Badge>;
    }
  };

  if (selectedAnalysis) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Button
              variant="flat"
              size="sm"
              onPress={() => setSelectedAnalysis(null)}
              className="mb-4"
            >
              ← Back to All Decks
            </Button>
            <h3 className="text-xl font-semibold mb-2">{selectedAnalysis.summary?.companyName}</h3>
            <p className="text-[var(--app-text-muted)] mb-2">{selectedAnalysis.summary?.tagline}</p>
            <div className="flex items-center gap-2">
              <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                {selectedAnalysis.extractedData?.slides} slides
              </Badge>
              {getStatusBadge(selectedAnalysis.status)}
              <span className="text-xs text-[var(--app-text-muted)]">
                Analyzed on {new Date(selectedAnalysis.uploadDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="flat" size="sm" startContent={<Eye className="w-4 h-4" />}>
              View Deck
            </Button>
            <Button variant="flat" size="sm" startContent={<Download className="w-4 h-4" />}>
              Export Analysis
            </Button>
          </div>
        </div>

        {/* AI Insights Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card padding="md" className="border-[var(--app-success)]">
            <h4 className="text-sm font-medium text-[var(--app-success)] mb-2">Strengths</h4>
            <ul className="space-y-1">
              {selectedAnalysis.strengths?.map((strength, idx) => (
                <li key={idx} className="text-xs text-[var(--app-text)]">• {strength}</li>
              ))}
            </ul>
          </Card>
          <Card padding="md" className="border-[var(--app-warning)]">
            <h4 className="text-sm font-medium text-[var(--app-warning)] mb-2">Red Flags</h4>
            <ul className="space-y-1">
              {selectedAnalysis.redFlags?.map((flag, idx) => (
                <li key={idx} className="text-xs text-[var(--app-text)]">• {flag}</li>
              ))}
            </ul>
          </Card>
          <Card padding="md" className="border-[var(--app-info)]">
            <h4 className="text-sm font-medium text-[var(--app-info)] mb-2">AI Insights</h4>
            <ul className="space-y-1">
              {selectedAnalysis.aiInsights?.slice(0, 3).map((insight, idx) => (
                <li key={idx} className="text-xs text-[var(--app-text)]">• {insight}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem & Solution */}
          <Card padding="md">
            <h4 className="font-medium mb-3">Problem & Solution</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[var(--app-text-muted)] mb-1">Problem</p>
                <p className="text-sm">{selectedAnalysis.summary?.problem}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--app-text-muted)] mb-1">Solution</p>
                <p className="text-sm">{selectedAnalysis.summary?.solution}</p>
              </div>
            </div>
          </Card>

          {/* Market Size */}
          <Card padding="md">
            <h4 className="font-medium mb-3">Market Opportunity</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--app-text-muted)]">TAM</span>
                <span className="text-lg font-semibold text-[var(--app-primary)]">
                  {selectedAnalysis.summary?.marketSize.tam}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--app-text-muted)]">SAM</span>
                <span className="text-lg font-semibold">{selectedAnalysis.summary?.marketSize.sam}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--app-text-muted)]">SOM (3-year)</span>
                <span className="text-lg font-semibold">{selectedAnalysis.summary?.marketSize.som}</span>
              </div>
            </div>
          </Card>

          {/* Traction */}
          <Card padding="md">
            <h4 className="font-medium mb-3">Traction</h4>
            <ul className="space-y-2">
              {selectedAnalysis.summary?.traction.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[var(--app-success)]" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          {/* Team */}
          <Card padding="md">
            <h4 className="font-medium mb-3">Team</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[var(--app-text-muted)] mb-2">Founders</p>
                <ul className="space-y-1">
                  {selectedAnalysis.summary?.team.founders.map((founder, idx) => (
                    <li key={idx} className="text-sm">• {founder}</li>
                  ))}
                </ul>
              </div>
              {selectedAnalysis.summary?.team.keyHires.length! > 0 && (
                <div>
                  <p className="text-xs text-[var(--app-text-muted)] mb-2">Key Hires</p>
                  <ul className="space-y-1">
                    {selectedAnalysis.summary?.team.keyHires.map((hire, idx) => (
                      <li key={idx} className="text-sm">• {hire}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Key Metrics */}
        <Card padding="md">
          <h4 className="font-medium mb-4">Key Metrics Extracted</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedAnalysis.extractedData?.keyMetrics.map((metric, idx) => (
              <div key={idx} className="text-center p-3 rounded-lg bg-[var(--app-surface-hover)]">
                <p className="text-xs text-[var(--app-text-muted)] mb-1">{metric.label}</p>
                <p className="text-lg font-semibold text-[var(--app-primary)]">{metric.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Financials */}
        <Card padding="md">
          <h4 className="font-medium mb-4">Financials & Ask</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[var(--app-text-muted)] mb-1">Current Revenue</p>
              <p className="text-xl font-semibold">{selectedAnalysis.summary?.financials.revenue}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--app-text-muted)] mb-1">Runway</p>
              <p className="text-xl font-semibold">{selectedAnalysis.summary?.financials.runway}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--app-text-muted)] mb-1">Ask Amount</p>
              <p className="text-xl font-semibold text-[var(--app-primary)]">
                {selectedAnalysis.summary?.financials.askAmount}
              </p>
            </div>
          </div>
        </Card>

        {/* Business Model & Competition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="md">
            <h4 className="font-medium mb-3">Business Model</h4>
            <p className="text-sm">{selectedAnalysis.summary?.businessModel}</p>
          </Card>
          <Card padding="md">
            <h4 className="font-medium mb-3">Competition</h4>
            <div className="flex flex-wrap gap-2">
              {selectedAnalysis.summary?.competition.map((competitor, idx) => (
                <Badge key={idx} size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                  {competitor}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">AI Pitch Deck Reader</h3>
          </div>
          <Button
            color="primary"
            startContent={<Upload className="w-4 h-4" />}
            onPress={handleFileUpload}
            isLoading={isUploading}
          >
            Upload Deck
          </Button>
        </div>
        <p className="text-sm text-[var(--app-text-muted)]">
          AI-powered analysis extracts key information, metrics, and insights from pitch decks
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card padding="md" className="mb-6 border-[var(--app-primary)]">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-[var(--app-primary)] animate-spin" />
            <span className="font-medium">Analyzing pitch deck...</span>
          </div>
          <Progress value={45} maxValue={100} className="mb-2" />
          <p className="text-xs text-[var(--app-text-muted)]">
            Extracting slides, identifying key metrics, and generating insights
          </p>
        </Card>
      )}

      {/* Analyzed Decks List */}
      <div className="space-y-3">
        {analyses.map((analysis) => (
          <Card
            key={analysis.id}
            padding="md"
            isPressable
            onPress={() => analysis.status === 'completed' && setSelectedAnalysis(analysis)}
            className={`cursor-pointer transition-all ${
              analysis.status === 'completed' ? 'hover:border-[var(--app-primary)]' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(analysis.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{analysis.fileName}</h4>
                    {getStatusBadge(analysis.status)}
                  </div>
                  {analysis.status === 'completed' && analysis.summary && (
                    <>
                      <p className="text-sm text-[var(--app-text-muted)] mb-2">
                        {analysis.summary.companyName} - {analysis.summary.tagline}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                          {analysis.extractedData?.slides} slides
                        </Badge>
                        <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
                          {analysis.strengths?.length} strengths
                        </Badge>
                        <Badge size="sm" variant="flat" className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]">
                          {analysis.redFlags?.length} red flags
                        </Badge>
                      </div>
                    </>
                  )}
                  {analysis.status === 'processing' && (
                    <p className="text-sm text-[var(--app-text-muted)]">
                      AI analysis in progress...
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--app-text-muted)]">
                  {new Date(analysis.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {analyses.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--app-text-subtle)] opacity-50" />
          <p className="text-[var(--app-text-muted)] mb-4">No pitch decks analyzed yet</p>
          <Button
            color="primary"
            startContent={<Upload className="w-4 h-4" />}
            onPress={handleFileUpload}
          >
            Upload Your First Deck
          </Button>
        </div>
      )}
    </Card>
  );
}
