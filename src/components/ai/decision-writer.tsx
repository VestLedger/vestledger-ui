'use client'

import { useState } from 'react';
import { Card, Button, Badge, Input } from '@/ui';
import { Sparkles, Send, Copy, Download, ThumbsDown, AlertCircle, Check, FileText, Edit3, RefreshCw, Wand2, MessageSquare } from 'lucide-react';

interface RejectionReason {
  id: string;
  category: 'market' | 'team' | 'product' | 'financials' | 'fit' | 'timing' | 'other';
  label: string;
  selected: boolean;
}

interface DealInfo {
  companyName: string;
  founderName: string;
  sector: string;
  stage: string;
}

const rejectionReasons: RejectionReason[] = [
  { id: '1', category: 'market', label: 'Market size too small', selected: false },
  { id: '2', category: 'market', label: 'Highly competitive landscape', selected: false },
  { id: '3', category: 'market', label: 'Market timing concerns', selected: false },
  { id: '4', category: 'team', label: 'Team lacks domain expertise', selected: false },
  { id: '5', category: 'team', label: 'Team composition gaps', selected: false },
  { id: '6', category: 'product', label: 'Product-market fit unclear', selected: false },
  { id: '7', category: 'product', label: 'Insufficient differentiation', selected: false },
  { id: '8', category: 'product', label: 'Technology risk', selected: false },
  { id: '9', category: 'financials', label: 'Unit economics not compelling', selected: false },
  { id: '10', category: 'financials', label: 'Capital requirements too high', selected: false },
  { id: '11', category: 'financials', label: 'Valuation mismatch', selected: false },
  { id: '12', category: 'fit', label: 'Outside fund thesis', selected: false },
  { id: '13', category: 'fit', label: 'Stage mismatch', selected: false },
  { id: '14', category: 'timing', label: 'Too early for our fund', selected: false },
  { id: '15', category: 'timing', label: 'Portfolio capacity constraints', selected: false },
];

const toneOptions = [
  { value: 'warm', label: 'Warm & Encouraging', description: 'Supportive and friendly' },
  { value: 'professional', label: 'Professional', description: 'Balanced and respectful' },
  { value: 'concise', label: 'Brief & Direct', description: 'Short and to the point' },
];

export function DecisionWriter() {
  const [dealInfo, setDealInfo] = useState<DealInfo>({
    companyName: 'Quantum AI',
    founderName: 'Sarah Chen',
    sector: 'AI/ML',
    stage: 'Series A'
  });
  const [reasons, setReasons] = useState<RejectionReason[]>(rejectionReasons);
  const [customReason, setCustomReason] = useState('');
  const [tone, setTone] = useState('warm');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [letterCopied, setLetterCopied] = useState(false);

  const toggleReason = (reasonId: string) => {
    setReasons(prev => prev.map(r =>
      r.id === reasonId ? { ...r, selected: !r.selected } : r
    ));
  };

  const generateLetter = async () => {
    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const selectedReasons = reasons.filter(r => r.selected);
      const letter = generateMockLetter(dealInfo, selectedReasons, customReason, tone);
      setGeneratedLetter(letter);
      setIsGenerating(false);
    }, 2000);
  };

  const generateMockLetter = (
    deal: DealInfo,
    selectedReasons: RejectionReason[],
    custom: string,
    tone: string
  ): string => {
    const greeting = tone === 'concise'
      ? `Hi ${deal.founderName},`
      : `Dear ${deal.founderName},`;

    const opening = tone === 'warm'
      ? `Thank you for taking the time to share ${deal.companyName} with us. We truly appreciate your efforts in building what is clearly an ambitious vision in the ${deal.sector} space.`
      : tone === 'professional'
      ? `Thank you for presenting ${deal.companyName}. We appreciate the opportunity to learn about your work in the ${deal.sector} sector.`
      : `Thank you for presenting ${deal.companyName}.`;

    const decision = tone === 'concise'
      ? `After careful review, we've decided not to move forward at this time.`
      : `After thorough consideration and discussion with our investment team, we've decided not to proceed with an investment in ${deal.companyName} at this time.`;

    let reasonsText = '';
    if (selectedReasons.length > 0 || custom) {
      if (tone === 'warm') {
        reasonsText = `\n\nWhile we see potential in what you're building, our decision was influenced by several factors:\n\n`;
      } else if (tone === 'professional') {
        reasonsText = `\n\nOur decision was based on the following considerations:\n\n`;
      } else {
        reasonsText = `\n\nKey factors:\n\n`;
      }

      selectedReasons.forEach((reason, idx) => {
        reasonsText += `${idx + 1}. ${reason.label}\n`;
      });

      if (custom) {
        reasonsText += `${selectedReasons.length + 1}. ${custom}\n`;
      }
    }

    const closing = tone === 'warm'
      ? `\n\nWe're impressed by what you've accomplished and wish you the very best as you continue to grow ${deal.companyName}. We'd love to stay in touch and would be happy to reconnect as the company evolves.\n\nPlease don't hesitate to reach out if we can be helpful in any other way, whether through introductions or advice.`
      : tone === 'professional'
      ? `\n\nWe appreciate your time and wish you success with ${deal.companyName}. Please feel free to stay in touch as your company progresses.`
      : `\n\nBest of luck with ${deal.companyName}.`;

    const signature = `\n\nBest regards,\n[Your Name]\n[Fund Name]`;

    return `${greeting}\n\n${opening}\n\n${decision}${reasonsText}${closing}${signature}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setLetterCopied(true);
    setTimeout(() => setLetterCopied(false), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]';
      case 'team': return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'product': return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      case 'financials': return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'fit': return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      default: return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Deal Information */}
          <Card padding="lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--app-primary)]" />
              Deal Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <Input
                  value={dealInfo.companyName}
                  onChange={(e) => setDealInfo({ ...dealInfo, companyName: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Founder Name</label>
                <Input
                  value={dealInfo.founderName}
                  onChange={(e) => setDealInfo({ ...dealInfo, founderName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sector</label>
                  <Input
                    value={dealInfo.sector}
                    onChange={(e) => setDealInfo({ ...dealInfo, sector: e.target.value })}
                    placeholder="AI/ML"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Stage</label>
                  <Input
                    value={dealInfo.stage}
                    onChange={(e) => setDealInfo({ ...dealInfo, stage: e.target.value })}
                    placeholder="Series A"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Rejection Reasons */}
          <Card padding="lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-[var(--app-primary)]" />
              Rejection Reasons
            </h3>

            <div className="space-y-4">
              {['market', 'team', 'product', 'financials', 'fit', 'timing', 'other'].map(category => {
                const categoryReasons = reasons.filter(r => r.category === category);
                if (categoryReasons.length === 0) return null;

                return (
                  <div key={category}>
                    <p className="text-xs font-medium text-[var(--app-text-muted)] mb-2 uppercase">
                      {category}
                    </p>
                    <div className="space-y-2">
                      {categoryReasons.map(reason => (
                        <button
                          key={reason.id}
                          onClick={() => toggleReason(reason.id)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            reason.selected
                              ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                              : 'border-[var(--app-border)] hover:border-[var(--app-primary)] hover:bg-[var(--app-surface-hover)]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{reason.label}</span>
                            {reason.selected && (
                              <Check className="w-4 h-4 text-[var(--app-primary)]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="text-sm font-medium mb-2 block">Custom Reason (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] min-h-[80px]"
                  placeholder="Add a custom reason specific to this deal..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Tone Selection */}
          <Card padding="lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--app-primary)]" />
              Letter Tone
            </h3>

            <div className="space-y-2">
              {toneOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTone(option.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    tone === option.value
                      ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                      : 'border-[var(--app-border)] hover:border-[var(--app-primary)] hover:bg-[var(--app-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-[var(--app-text-muted)]">{option.description}</p>
                    </div>
                    {tone === option.value && (
                      <Check className="w-4 h-4 text-[var(--app-primary)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Generate Button */}
          <Button
            color="primary"
            size="lg"
            className="w-full"
            startContent={<Wand2 className="w-5 h-5" />}
            onPress={generateLetter}
            isLoading={isGenerating}
            isDisabled={!dealInfo.companyName || !dealInfo.founderName}
          >
            {isGenerating ? 'Generating...' : 'Generate Letter'}
          </Button>
        </div>

        {/* Output Section */}
        <div>
          <Card padding="lg" className="sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--app-primary)]" />
                Generated Letter
              </h3>
              {generatedLetter && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<RefreshCw className="w-3 h-3" />}
                    onPress={generateLetter}
                  >
                    Regenerate
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Edit3 className="w-3 h-3" />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={letterCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    onPress={copyToClipboard}
                  >
                    {letterCopied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Download className="w-3 h-3" />}
                  >
                    Export
                  </Button>
                </div>
              )}
            </div>

            {generatedLetter ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[var(--app-surface-hover)] border border-[var(--app-border)]">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--app-text)]">
                    {generatedLetter}
                  </pre>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    color="primary"
                    className="flex-1"
                    startContent={<Send className="w-4 h-4" />}
                  >
                    Send Email
                  </Button>
                  <Button
                    variant="flat"
                    className="flex-1"
                  >
                    Save as Draft
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-[var(--app-success-bg)] border border-[var(--app-success)]/20">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[var(--app-success)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[var(--app-success)] mb-1">
                        Letter Ready
                      </p>
                      <p className="text-xs text-[var(--app-text-muted)]">
                        Your personalized rejection letter has been generated. Review and edit as needed before sending.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-[var(--app-primary-bg)] flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-[var(--app-primary)]" />
                </div>
                <p className="text-center text-[var(--app-text-muted)] mb-2">
                  No letter generated yet
                </p>
                <p className="text-center text-sm text-[var(--app-text-subtle)]">
                  Fill in the deal information and select reasons to generate a personalized rejection letter
                </p>
              </div>
            )}
          </Card>

          {/* Tips */}
          <Card padding="md" className="mt-4 bg-[var(--app-info-bg)] border-[var(--app-info)]/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--app-info)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--app-info)] mb-1">
                  Best Practices
                </p>
                <ul className="text-xs text-[var(--app-text-muted)] space-y-1 list-disc list-inside">
                  <li>Select 2-4 specific reasons for authenticity</li>
                  <li>Warm tone helps maintain relationships for future opportunities</li>
                  <li>Always review and personalize before sending</li>
                  <li>Consider offering specific feedback when appropriate</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
