'use client';

import { BarChart3, TrendingUp, Database, FileText, Search, Layers, PieChart, Download } from 'lucide-react';
import { Card, Button, Badge, PageContainer } from '@/ui';
import { MetricCard } from '@/components/metric-card';

export function ResearcherDashboard() {
  const metrics = [
    {
      label: 'Reports Generated',
      value: '24',
      change: '+5 this week',
      trend: 'up' as const,
      icon: FileText,
    },
    {
      label: 'Data Sources',
      value: '12',
      change: 'Active',
      trend: 'up' as const,
      icon: Database,
    },
    {
      label: 'Market Trends',
      value: '8',
      change: 'New signals',
      trend: 'up' as const,
      icon: TrendingUp,
    },
    {
      label: 'Benchmark Score',
      value: '92',
      change: 'Top Quartile',
      trend: 'up' as const,
      icon: BarChart3,
    },
  ];

  const recentReports = [
    { name: 'Q3 Market Analysis', type: 'Market', date: 'Today', status: 'Published' },
    { name: 'AI Sector Deep Dive', type: 'Sector', date: 'Yesterday', status: 'Draft' },
    { name: 'Fund III Benchmark', type: 'Internal', date: '3 days ago', status: 'Published' },
  ];

  const trendingTopics = [
    { topic: 'Generative AI Valuations', sentiment: 'Hot', change: '+45%' },
    { topic: 'Climate Tech Funding', sentiment: 'Rising', change: '+22%' },
    { topic: 'Crypto VC Activity', sentiment: 'Mixed', change: '-8%' },
    { topic: 'Healthcare SaaS', sentiment: 'Stable', change: '+5%' },
  ];

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Research Hub</h2>
          <p className="text-sm text-[var(--app-text-muted)]">Analytics, market trends, and benchmarking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="bordered" startContent={<Search className="w-4 h-4" />}>
            Query Data
          </Button>
          <Button color="primary" startContent={<FileText className="w-4 h-4" />}>
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding="md">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-medium">Recent Reports</h3>
             <Button size="sm" variant="light">View All</Button>
           </div>
           <div className="space-y-4">
             {recentReports.map((report, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-hover)] transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-[var(--app-primary-bg)] flex items-center justify-center text-[var(--app-primary)]">
                     <FileText className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="font-medium">{report.name}</div>
                     <div className="text-xs text-[var(--app-text-muted)]">{report.type} Report • {report.date}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Badge variant="flat" color={report.status === 'Published' ? 'success' : 'warning'}>
                      {report.status}
                    </Badge>
                    <Button size="sm" variant="light" isIconOnly>
                      <Download className="w-4 h-4" />
                    </Button>
                 </div>
               </div>
             ))}
           </div>
        </Card>

        <Card padding="md">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Trending Topics
          </h3>
          <div className="space-y-3">
            {trendingTopics.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                 <div>
                   <div className="text-sm font-medium">{item.topic}</div>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                     item.sentiment === 'Hot' ? 'bg-red-500/10 text-red-500' : 
                     item.sentiment === 'Rising' ? 'bg-green-500/10 text-green-500' : 
                     item.sentiment === 'Mixed' ? 'bg-yellow-500/10 text-yellow-500' :
                     'bg-gray-500/10 text-gray-500'
                   }`}>
                     {item.sentiment}
                   </span>
                 </div>
                 <span className={`text-sm font-medium ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                   {item.change}
                 </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
