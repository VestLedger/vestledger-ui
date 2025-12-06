'use client'

import { useState } from 'react';
import { Card, Button, Badge, Progress } from '@/ui';
import { ThumbsUp, ThumbsDown, MinusCircle, MessageSquare, Users, Building2, TrendingUp, DollarSign, Target, Lightbulb, Share2, Download, Play, Pause, SkipForward, SkipBack, Maximize2, Plus, Edit3 } from 'lucide-react';

interface Deal {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  askAmount: number;
  valuation: number;
  arr: number;
  growth: number;
  founderName: string;
  location: string;
  oneLiner: string;
}

interface SlideContent {
  id: string;
  type: 'overview' | 'team' | 'market' | 'product' | 'financials' | 'competition' | 'ask';
  title: string;
  content: any;
}

interface Vote {
  partnerId: string;
  partnerName: string;
  vote: 'yes' | 'no' | 'maybe';
  comments?: string;
  timestamp: string;
}

interface ReviewSession {
  id: string;
  dealId: string;
  scheduledDate: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  votes: Vote[];
  decision?: 'proceed' | 'pass' | 'defer';
}

const mockDeals: Deal[] = [
  {
    id: '1',
    companyName: 'Quantum AI',
    sector: 'AI/ML',
    stage: 'Series A',
    askAmount: 15000000,
    valuation: 75000000,
    arr: 2500000,
    growth: 300,
    founderName: 'Sarah Chen',
    location: 'San Francisco, CA',
    oneLiner: 'Enterprise quantum computing platform accessible via API'
  },
  {
    id: '2',
    companyName: 'NeuroLink',
    sector: 'HealthTech',
    stage: 'Seed',
    askAmount: 3000000,
    valuation: 12000000,
    arr: 500000,
    growth: 450,
    founderName: 'Michael Rodriguez',
    location: 'Boston, MA',
    oneLiner: 'AI-powered neural diagnostics for early disease detection'
  }
];

const generateSlides = (deal: Deal): SlideContent[] => [
  {
    id: '1',
    type: 'overview',
    title: 'Company Overview',
    content: {
      companyName: deal.companyName,
      oneLiner: deal.oneLiner,
      founder: deal.founderName,
      location: deal.location,
      sector: deal.sector,
      stage: deal.stage
    }
  },
  {
    id: '2',
    type: 'market',
    title: 'Market Opportunity',
    content: {
      tam: '$50B',
      sam: '$15B',
      som: '$2B',
      growth: '25% CAGR',
      competitors: ['Competitor A', 'Competitor B', 'Competitor C']
    }
  },
  {
    id: '3',
    type: 'product',
    title: 'Product & Technology',
    content: {
      description: 'Hybrid quantum-classical computing platform',
      differentiators: ['API-first approach', 'Enterprise security', 'Easy integration'],
      techStack: ['Quantum algorithms', 'Cloud infrastructure', 'RESTful APIs']
    }
  },
  {
    id: '4',
    type: 'financials',
    title: 'Financial Metrics',
    content: {
      arr: deal.arr,
      growth: deal.growth,
      burn: 400000,
      runway: 18,
      ltv: 250000,
      cac: 50000,
      grossMargin: 75
    }
  },
  {
    id: '5',
    type: 'team',
    title: 'Team',
    content: {
      founder: deal.founderName,
      team: [
        { name: 'Sarah Chen', role: 'CEO', background: 'Stanford PhD, ex-Google' },
        { name: 'David Kim', role: 'CTO', background: 'MIT PhD, ex-IBM Quantum' },
        { name: 'Lisa Wang', role: 'VP Sales', background: 'ex-Salesforce, 15yr enterprise' }
      ],
      advisors: ['Prof. John Smith (Stanford)', 'Dr. Emily Brown (MIT)']
    }
  },
  {
    id: '6',
    type: 'ask',
    title: 'Investment Ask',
    content: {
      amount: deal.askAmount,
      valuation: deal.valuation,
      useOfFunds: [
        { category: 'Product Development', percentage: 40 },
        { category: 'Sales & Marketing', percentage: 35 },
        { category: 'Operations', percentage: 15 },
        { category: 'Hiring', percentage: 10 }
      ]
    }
  }
];

export function DealflowReview() {
  const [selectedDeal, setSelectedDeal] = useState<Deal>(mockDeals[0]);
  const [slides, setSlides] = useState<SlideContent[]>(generateSlides(mockDeals[0]));
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [myVote, setMyVote] = useState<'yes' | 'no' | 'maybe' | null>(null);
  const [voteComment, setVoteComment] = useState('');

  const currentSlide = slides[currentSlideIndex];

  const handleVote = (vote: 'yes' | 'no' | 'maybe') => {
    setMyVote(vote);
    const newVote: Vote = {
      partnerId: 'current-user',
      partnerName: 'Current User',
      vote,
      comments: voteComment,
      timestamp: new Date().toISOString()
    };
    setVotes([...votes, newVote]);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const renderSlideContent = () => {
    switch (currentSlide.type) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-accent)] bg-clip-text text-transparent">
                {currentSlide.content.companyName}
              </h1>
              <p className="text-xl text-[var(--app-text-muted)] mb-6">{currentSlide.content.oneLiner}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">Founder</p>
                <p className="text-lg font-semibold">{currentSlide.content.founder}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">Location</p>
                <p className="text-lg font-semibold">{currentSlide.content.location}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">Sector</p>
                <p className="text-lg font-semibold">{currentSlide.content.sector}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">Stage</p>
                <p className="text-lg font-semibold">{currentSlide.content.stage}</p>
              </div>
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 rounded-lg bg-[var(--app-primary-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">TAM</p>
                <p className="text-3xl font-bold text-[var(--app-primary)]">{currentSlide.content.tam}</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-secondary)] bg-opacity-10 text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">SAM</p>
                <p className="text-3xl font-bold text-[var(--app-secondary)]">{currentSlide.content.sam}</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-success-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">SOM</p>
                <p className="text-3xl font-bold text-[var(--app-success)]">{currentSlide.content.som}</p>
              </div>
            </div>
            <div className="p-6 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Market Growth</p>
              <p className="text-2xl font-bold">{currentSlide.content.growth}</p>
            </div>
            <div>
              <p className="font-semibold mb-3">Key Competitors</p>
              <div className="flex flex-wrap gap-2">
                {currentSlide.content.competitors.map((comp: string, idx: number) => (
                  <Badge key={idx} size="lg" variant="flat" className="bg-[var(--app-surface-hover)]">
                    {comp}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'product':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-lg mb-4">{currentSlide.content.description}</p>
            </div>
            <div>
              <p className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--app-primary)]" />
                Key Differentiators
              </p>
              <div className="space-y-2">
                {currentSlide.content.differentiators.map((diff: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-[var(--app-primary-bg)]">
                    <div className="w-6 h-6 rounded-full bg-[var(--app-primary)] text-white flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <span>{diff}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'financials':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-lg bg-[var(--app-success-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">ARR</p>
                <p className="text-3xl font-bold text-[var(--app-success)]">{formatCurrency(currentSlide.content.arr)}</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-primary-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">YoY Growth</p>
                <p className="text-3xl font-bold text-[var(--app-primary)]">{currentSlide.content.growth}%</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-warning-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">Monthly Burn</p>
                <p className="text-3xl font-bold text-[var(--app-warning)]">{formatCurrency(currentSlide.content.burn)}</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--app-info-bg)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-2">Runway</p>
                <p className="text-3xl font-bold text-[var(--app-info)]">{currentSlide.content.runway}mo</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">LTV</p>
                <p className="text-xl font-bold">{formatCurrency(currentSlide.content.ltv)}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">CAC</p>
                <p className="text-xl font-bold">{formatCurrency(currentSlide.content.cac)}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--app-surface-hover)] text-center">
                <p className="text-sm text-[var(--app-text-muted)] mb-1">LTV:CAC</p>
                <p className="text-xl font-bold text-[var(--app-success)]">
                  {(currentSlide.content.ltv / currentSlide.content.cac).toFixed(1)}x
                </p>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div>
              <p className="font-semibold mb-3">Leadership Team</p>
              <div className="space-y-3">
                {currentSlide.content.team.map((member: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-[var(--app-surface-hover)]">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center text-white font-semibold">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-[var(--app-primary)]">{member.role}</p>
                      <p className="text-sm text-[var(--app-text-muted)]">{member.background}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3">Advisors</p>
              <div className="flex flex-wrap gap-2">
                {currentSlide.content.advisors.map((advisor: string, idx: number) => (
                  <Badge key={idx} size="lg" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                    {advisor}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ask':
        return (
          <div className="space-y-6">
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-[var(--app-primary-bg)] to-[var(--app-secondary)] bg-opacity-10">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Raising</p>
              <p className="text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-secondary)] bg-clip-text text-transparent">
                {formatCurrency(currentSlide.content.amount)}
              </p>
              <p className="text-sm text-[var(--app-text-muted)]">
                at {formatCurrency(currentSlide.content.valuation)} pre-money valuation
              </p>
            </div>
            <div>
              <p className="font-semibold mb-3">Use of Funds</p>
              <div className="space-y-3">
                {currentSlide.content.useOfFunds.map((item: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-[var(--app-text-muted)]">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} maxValue={100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dealflow Review Session</h2>
          <p className="text-sm text-[var(--app-text-muted)] mt-1">
            Collaborative deal review with slide presentation and voting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="flat" startContent={<Share2 className="w-4 h-4" />}>
            Share
          </Button>
          <Button variant="flat" startContent={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button
            color="primary"
            startContent={isPresenting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            onPress={() => setIsPresenting(!isPresenting)}
          >
            {isPresenting ? 'Stop Presenting' : 'Start Presentation'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Slide Navigation */}
        <div className="lg:col-span-1">
          <Card padding="md">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--app-primary)]" />
              Slides
            </h3>
            <div className="space-y-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    idx === currentSlideIndex
                      ? 'bg-[var(--app-primary)] text-white'
                      : 'bg-[var(--app-surface-hover)] hover:bg-[var(--app-primary-bg)]'
                  }`}
                >
                  <p className="text-xs opacity-75 mb-1">Slide {idx + 1}</p>
                  <p className="text-sm font-medium">{slide.title}</p>
                </button>
              ))}
            </div>

            <Button
              className="w-full mt-4"
              variant="flat"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
            >
              Add Slide
            </Button>
          </Card>

          {/* Voting Panel */}
          <Card padding="md" className="mt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--app-primary)]" />
              Vote
            </h3>
            <div className="space-y-2">
              <Button
                className="w-full"
                color={myVote === 'yes' ? 'success' : 'default'}
                variant={myVote === 'yes' ? 'solid' : 'flat'}
                startContent={<ThumbsUp className="w-4 h-4" />}
                onPress={() => handleVote('yes')}
              >
                Yes - Proceed
              </Button>
              <Button
                className="w-full"
                color={myVote === 'maybe' ? 'warning' : 'default'}
                variant={myVote === 'maybe' ? 'solid' : 'flat'}
                startContent={<MinusCircle className="w-4 h-4" />}
                onPress={() => handleVote('maybe')}
              >
                Maybe - More DD
              </Button>
              <Button
                className="w-full"
                color={myVote === 'no' ? 'danger' : 'default'}
                variant={myVote === 'no' ? 'solid' : 'flat'}
                startContent={<ThumbsDown className="w-4 h-4" />}
                onPress={() => handleVote('no')}
              >
                No - Pass
              </Button>
            </div>

            {votes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--app-border)]">
                <p className="text-xs text-[var(--app-text-muted)] mb-2">Votes Cast</p>
                <div className="space-y-1">
                  {votes.map((vote, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span>{vote.partnerName}</span>
                      <Badge
                        size="sm"
                        className={
                          vote.vote === 'yes'
                            ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]'
                            : vote.vote === 'no'
                            ? 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]'
                            : 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'
                        }
                      >
                        {vote.vote}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Main Slide Display */}
        <div className="lg:col-span-3">
          <Card padding="lg" className="min-h-[600px]">
            {/* Slide Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--app-border)]">
              <div>
                <Badge size="sm" variant="flat" className="mb-2">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </Badge>
                <h3 className="text-2xl font-bold">{currentSlide.title}</h3>
              </div>
              <Button size="sm" variant="flat" isIconOnly>
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>

            {/* Slide Content */}
            <div className="mb-6">{renderSlideContent()}</div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--app-border)]">
              <Button
                variant="flat"
                startContent={<SkipBack className="w-4 h-4" />}
                onPress={prevSlide}
                isDisabled={currentSlideIndex === 0}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentSlideIndex ? 'bg-[var(--app-primary)]' : 'bg-[var(--app-border)]'
                    }`}
                  />
                ))}
              </div>

              <Button
                color="primary"
                endContent={<SkipForward className="w-4 h-4" />}
                onPress={nextSlide}
                isDisabled={currentSlideIndex === slides.length - 1}
              >
                Next
              </Button>
            </div>
          </Card>

          {/* Comments Section */}
          <Card padding="md" className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[var(--app-primary)]" />
              <h4 className="font-semibold">Discussion</h4>
            </div>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] min-h-[80px]"
              placeholder="Add your thoughts, questions, or concerns..."
              value={voteComment}
              onChange={(e) => setVoteComment(e.target.value)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
