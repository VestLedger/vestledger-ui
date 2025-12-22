'use client'

import { useEffect } from 'react';
import { Card, Button, Badge, Progress } from '@/ui';
import { Upload, FileText, Sparkles, CheckCircle2, Clock, Download, Eye } from 'lucide-react';
import { DocumentPreviewModal, useDocumentPreview, getMockDocumentUrl } from '@/components/documents/preview';
import { useUIKey } from '@/store/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pitchDeckUploadRequested } from '@/store/slices/uiEffectsSlice';
import { pitchDeckAnalysesRequested, pitchDeckSelectors } from '@/store/slices/aiSlice';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-states';
import { StatusBadge } from '@/components/ui';

const defaultPitchDeckReaderState = {
  selectedAnalysisId: null as string | null,
  isUploading: false,
};

export function PitchDeckReader() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(pitchDeckSelectors.selectData);
  const status = useAppSelector(pitchDeckSelectors.selectStatus);
  const error = useAppSelector(pitchDeckSelectors.selectError);

  const analyses = data?.analyses || [];

  // Load pitch deck analyses on mount
  useEffect(() => {
    dispatch(pitchDeckAnalysesRequested({}));
  }, [dispatch]);
  const { value: ui, patch: patchUI } = useUIKey<{ selectedAnalysisId: string | null; isUploading: boolean }>(
    'pitch-deck-reader',
    defaultPitchDeckReaderState
  );
  const { selectedAnalysisId, isUploading } = ui;
  const selectedAnalysis = analyses.find((analysis) => analysis.id === selectedAnalysisId) ?? null;
  const preview = useDocumentPreview();

  const handleFileUpload = () => {
    dispatch(pitchDeckUploadRequested());
  };

  if (status === 'idle' || status === 'loading') return <LoadingState message="Loading pitch deck analyses…" />;
  if (status === 'failed' && error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load pitch deck analyses"
        onRetry={() => dispatch(pitchDeckAnalysesRequested({}))}
      />
    );
  }
  if (status === 'succeeded' && analyses.length === 0) {
    return (
      <EmptyState
        icon={Upload}
        title="No pitch decks yet"
        message="Upload a pitch deck to generate an AI analysis."
        action={
          <Button color="primary" onPress={handleFileUpload}>
            Upload Pitch Deck
          </Button>
        }
      />
    );
  }

  if (selectedAnalysis) {
    const keyHires = selectedAnalysis.summary?.team.keyHires ?? [];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Button
              variant="flat"
              size="sm"
              onPress={() => patchUI({ selectedAnalysisId: null })}
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
              <StatusBadge status={selectedAnalysis.status} domain="general" size="sm" showIcon />
              <span className="text-xs text-[var(--app-text-muted)]">
                Analyzed on {new Date(selectedAnalysis.uploadDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="flat"
              size="sm"
              startContent={<Eye className="w-4 h-4" />}
              onPress={() => {
                if (selectedAnalysis) {
                  preview.openPreview({
                    id: selectedAnalysis.id,
                    name: selectedAnalysis.fileName,
                    type: 'pdf',
                    url: getMockDocumentUrl('pdf'),
                    metadata: {
                      aiInsights: selectedAnalysis.aiInsights ?? [],
                      summary: selectedAnalysis.summary ?? null,
                      extractedData: selectedAnalysis.extractedData ?? null,
                    },
                  });
                }
              }}
            >
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
              {keyHires.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--app-text-muted)] mb-2">Key Hires</p>
                  <ul className="space-y-1">
                    {keyHires.map((hire, idx) => (
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
          <Progress value={45} maxValue={100} className="mb-2" aria-label="Analyzing pitch deck 45%" />
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
            onPress={() => analysis.status === 'completed' && patchUI({ selectedAnalysisId: analysis.id })}
            className={`cursor-pointer transition-all ${
              analysis.status === 'completed' ? 'hover:border-[var(--app-primary)]' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{analysis.fileName}</h4>
                    <StatusBadge status={analysis.status} domain="general" size="sm" showIcon />
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

      {/* Document Preview Modal */}
      {preview.isOpen && preview.previewDocument && (
        <DocumentPreviewModal
          document={preview.previewDocument}
          isOpen={preview.isOpen}
          onClose={preview.closePreview}
        />
      )}
    </Card>
  );
}
