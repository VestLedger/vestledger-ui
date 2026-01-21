'use client'

import { Card, Button, Input } from '@/ui';
import { Sparkles, Send, Copy, Download, ThumbsDown, AlertCircle, Check, FileText, Edit3, RefreshCw, Wand2, MessageSquare } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { useAppDispatch } from '@/store/hooks';
import { decisionWriterCopyRequested, decisionWriterGenerateRequested } from '@/store/slices/uiEffectsSlice';
import {
  getDecisionWriterRejectionReasons,
  getDecisionWriterSeedDealInfo,
  getDecisionWriterToneOptions,
  type DealInfo,
  type DecisionWriterTone,
  type RejectionReason,
} from '@/services/ai/decisionWriterService';

const defaultDecisionWriterState: {
  dealInfo: DealInfo;
  reasons: RejectionReason[];
  customReason: string;
  tone: DecisionWriterTone;
  generatedLetter: string;
  isGenerating: boolean;
  letterCopied: boolean;
} = {
  dealInfo: getDecisionWriterSeedDealInfo(),
  reasons: getDecisionWriterRejectionReasons(),
  customReason: '',
  tone: 'warm',
  generatedLetter: '',
  isGenerating: false,
  letterCopied: false,
};

export function DecisionWriter() {
  const dispatch = useAppDispatch();
  const { value: ui, patch: patchUI } = useUIKey('decision-writer', defaultDecisionWriterState);
  const { dealInfo, reasons, customReason, tone, generatedLetter, isGenerating, letterCopied } = ui;
  const toneOptions = getDecisionWriterToneOptions();

  const toggleReason = (reasonId: string) => {
    patchUI({
      reasons: reasons.map((reason) =>
        reason.id === reasonId ? { ...reason, selected: !reason.selected } : reason
      ),
    });
  };

  const generateLetter = () => {
    dispatch(decisionWriterGenerateRequested());
  };

  const copyToClipboard = () => {
    dispatch(decisionWriterCopyRequested());
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Deal Information */}
          <Card padding="lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
              Deal Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <Input
                  value={dealInfo.companyName}
                  onChange={(e) => patchUI({ dealInfo: { ...dealInfo, companyName: e.target.value } })}
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Founder Name</label>
                <Input
                  value={dealInfo.founderName}
                  onChange={(e) => patchUI({ dealInfo: { ...dealInfo, founderName: e.target.value } })}
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sector</label>
                  <Input
                    value={dealInfo.sector}
                    onChange={(e) => patchUI({ dealInfo: { ...dealInfo, sector: e.target.value } })}
                    placeholder="AI/ML"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Stage</label>
                  <Input
                    value={dealInfo.stage}
                    onChange={(e) => patchUI({ dealInfo: { ...dealInfo, stage: e.target.value } })}
                    placeholder="Series A"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Rejection Reasons */}
          <Card padding="lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
              Rejection Reasons
            </h3>

            <div className="space-y-4">
              {['market', 'team', 'product', 'financials', 'fit', 'timing', 'other'].map(category => {
                const categoryReasons = reasons.filter(r => r.category === category);
                if (categoryReasons.length === 0) return null;

                return (
                  <div key={category}>
                    <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-2 uppercase">
                      {category}
                    </p>
                    <div className="space-y-2">
                      {categoryReasons.map(reason => (
                        <button
                          key={reason.id}
                          onClick={() => toggleReason(reason.id)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            reason.selected
                              ? 'border-app-primary dark:border-app-dark-primary bg-app-primary-bg dark:bg-app-dark-primary-bg'
                              : 'border-app-border dark:border-app-dark-border hover:border-app-primary dark:hover:border-app-dark-primary hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{reason.label}</span>
                            {reason.selected && (
                              <Check className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
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
                  className="w-full px-3 py-2 rounded-lg border border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface text-app-text dark:text-app-dark-text min-h-[80px]"
                  placeholder="Add a custom reason specific to this deal..."
                  value={customReason}
                  onChange={(e) => patchUI({ customReason: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* Tone Selection */}
          <Card padding="lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
              Letter Tone
            </h3>

            <div className="space-y-2">
              {toneOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => patchUI({ tone: option.value })}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    tone === option.value
                      ? 'border-app-primary dark:border-app-dark-primary bg-app-primary-bg dark:bg-app-dark-primary-bg'
                      : 'border-app-border dark:border-app-dark-border hover:border-app-primary dark:hover:border-app-dark-primary hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">{option.description}</p>
                    </div>
                    {tone === option.value && (
                      <Check className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
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
                <Sparkles className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
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
                <div className="p-4 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover border border-app-border dark:border-app-dark-border">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-app-text dark:text-app-dark-text">
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

                <div className="p-3 rounded-lg bg-app-success-bg dark:bg-app-dark-success-bg border border-app-success/20 dark:border-app-dark-success/20">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-app-success dark:text-app-dark-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-app-success dark:text-app-dark-success mb-1">
                        Letter Ready
                      </p>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
                        Your personalized rejection letter has been generated. Review and edit as needed before sending.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-app-primary-bg dark:bg-app-dark-primary-bg flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-app-primary dark:text-app-dark-primary" />
                </div>
                <p className="text-center text-app-text-muted dark:text-app-dark-text-muted mb-2">
                  No letter generated yet
                </p>
                <p className="text-center text-sm text-app-text-subtle dark:text-app-dark-text-subtle">
                  Fill in the deal information and select reasons to generate a personalized rejection letter
                </p>
              </div>
            )}
          </Card>

          {/* Tips */}
          <Card padding="md" className="mt-4 bg-app-info-bg dark:bg-app-dark-info-bg border-app-info/20 dark:border-app-dark-info/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-app-info dark:text-app-dark-info mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-app-info dark:text-app-dark-info mb-1">
                  Best Practices
                </p>
                <ul className="text-xs text-app-text-muted dark:text-app-dark-text-muted space-y-1 list-disc list-inside">
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
