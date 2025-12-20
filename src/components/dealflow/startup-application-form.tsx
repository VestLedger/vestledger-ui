'use client'

import { Card, Button, Input, Badge } from '@/ui';
import { Building2, User, Mail, Globe, DollarSign, Users, TrendingUp, FileText, CheckCircle2, Copy, Code } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { useAppDispatch } from '@/store/hooks';
import { startupApplicationSubmitRequested } from '@/store/slices/uiEffectsSlice';

interface FormData {
  companyName: string;
  website: string;
  founderName: string;
  founderEmail: string;
  coFounders: string;
  sector: string;
  stage: string;
  fundingAmount: string;
  currentRevenue: string;
  teamSize: string;
  location: string;
  pitchDeckUrl: string;
  oneLiner: string;
  problem: string;
  solution: string;
  traction: string;
}

const initialFormData: FormData = {
  companyName: '',
  website: '',
  founderName: '',
  founderEmail: '',
  coFounders: '',
  sector: '',
  stage: '',
  fundingAmount: '',
  currentRevenue: '',
  teamSize: '',
  location: '',
  pitchDeckUrl: '',
  oneLiner: '',
  problem: '',
  solution: '',
  traction: ''
};

export function StartupApplicationForm({ embedded = false }: { embedded?: boolean }) {
  const dispatch = useAppDispatch();
  const { value: ui, patch: patchUI } = useUIKey<{
    formData: FormData;
    isSubmitting: boolean;
    isSubmitted: boolean;
    showEmbedCode: boolean;
  }>('startup-application-form', {
    formData: initialFormData,
    isSubmitting: false,
    isSubmitted: false,
    showEmbedCode: false,
  });
  const { formData, isSubmitting, isSubmitted, showEmbedCode } = ui;

  const handleChange = (field: keyof FormData, value: string) => {
    patchUI({ formData: { ...formData, [field]: value } });
  };

  const handleSubmit = () => {
    dispatch(startupApplicationSubmitRequested());
  };

  const embedCode = `<!-- VestLedger Startup Application Form -->
<iframe
  src="https://vestledger.com/apply/${embedded ? 'your-fund-id' : 'demo'}"
  width="100%"
  height="1200px"
  frameborder="0"
  style="border: none; border-radius: 12px;"
></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
  };

  if (isSubmitted) {
    return (
      <Card padding="lg" className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[var(--app-success-bg)] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[var(--app-success)]" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
          <p className="text-[var(--app-text-muted)] mb-6">
            Thank you for your interest. Our team will review your application and get back to you within 5-7 business days.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="flat"
              onPress={() => {
                patchUI({ isSubmitted: false, formData: initialFormData });
              }}
            >
              Submit Another Application
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!embedded && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Startup Application Form</h2>
              <p className="text-[var(--app-text-muted)]">
                Embeddable form to capture startup applications directly into your dealflow
              </p>
            </div>
            <Button
              variant="flat"
              startContent={showEmbedCode ? <Code className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onPress={() => patchUI({ showEmbedCode: !showEmbedCode })}
            >
              {showEmbedCode ? 'Hide' : 'Get'} Embed Code
            </Button>
          </div>

          {showEmbedCode && (
            <Card padding="md" className="mb-6 bg-[var(--app-surface-hover)]">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h4 className="font-medium mb-1">Embed on Your Website</h4>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    Copy this code and paste it into your website to embed the application form
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Copy className="w-3 h-3" />}
                  onPress={copyEmbedCode}
                >
                  Copy
                </Button>
              </div>
              <pre className="bg-[var(--app-surface)] p-4 rounded-lg text-xs overflow-x-auto border border-[var(--app-border)]">
                <code>{embedCode}</code>
              </pre>
            </Card>
          )}
        </div>
      )}

      <Card padding="lg">
        <div className="space-y-6">
          {/* Company Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-[var(--app-primary)]" />
              <h3 className="font-semibold">Company Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name *"
                placeholder="Acme Inc."
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                required
              />
              <Input
                label="Website"
                placeholder="https://acme.com"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                startContent={<Globe className="w-4 h-4 text-[var(--app-text-subtle)]" />}
              />
              <Input
                label="One-Liner *"
                placeholder="We help companies do X by doing Y"
                value={formData.oneLiner}
                onChange={(e) => handleChange('oneLiner', e.target.value)}
                className="md:col-span-2"
                required
              />
            </div>
          </div>

          {/* Founder Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[var(--app-primary)]" />
              <h3 className="font-semibold">Founder Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Your Name *"
                placeholder="John Doe"
                value={formData.founderName}
                onChange={(e) => handleChange('founderName', e.target.value)}
                required
              />
              <Input
                label="Email *"
                type="email"
                placeholder="john@acme.com"
                value={formData.founderEmail}
                onChange={(e) => handleChange('founderEmail', e.target.value)}
                startContent={<Mail className="w-4 h-4 text-[var(--app-text-subtle)]" />}
                required
              />
              <Input
                label="Co-Founders"
                placeholder="Jane Smith, Bob Johnson"
                value={formData.coFounders}
                onChange={(e) => handleChange('coFounders', e.target.value)}
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Company Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[var(--app-primary)]" />
              <h3 className="font-semibold">Company Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[var(--app-text-muted)] mb-2 block">Sector *</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value)}
                  required
                >
                  <option value="">Select sector...</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="SaaS">SaaS</option>
                  <option value="FinTech">FinTech</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="Developer Tools">Developer Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-[var(--app-text-muted)] mb-2 block">Stage *</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                  value={formData.stage}
                  onChange={(e) => handleChange('stage', e.target.value)}
                  required
                >
                  <option value="">Select stage...</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C+">Series C+</option>
                </select>
              </div>
              <Input
                label="Funding Amount Sought"
                placeholder="$2M"
                value={formData.fundingAmount}
                onChange={(e) => handleChange('fundingAmount', e.target.value)}
                startContent={<DollarSign className="w-4 h-4 text-[var(--app-text-subtle)]" />}
              />
              <Input
                label="Current ARR/Revenue"
                placeholder="$500k"
                value={formData.currentRevenue}
                onChange={(e) => handleChange('currentRevenue', e.target.value)}
                startContent={<DollarSign className="w-4 h-4 text-[var(--app-text-subtle)]" />}
              />
              <Input
                label="Team Size"
                placeholder="5"
                value={formData.teamSize}
                onChange={(e) => handleChange('teamSize', e.target.value)}
                startContent={<Users className="w-4 h-4 text-[var(--app-text-subtle)]" />}
              />
              <Input
                label="Location"
                placeholder="San Francisco, CA"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </div>

          {/* Pitch & Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[var(--app-primary)]" />
              <h3 className="font-semibold">Pitch & Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--app-text-muted)] mb-2 block">Problem You're Solving *</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] min-h-[80px]"
                  placeholder="Describe the problem your startup is addressing..."
                  value={formData.problem}
                  onChange={(e) => handleChange('problem', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[var(--app-text-muted)] mb-2 block">Your Solution *</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] min-h-[80px]"
                  placeholder="Explain how your product/service solves this problem..."
                  value={formData.solution}
                  onChange={(e) => handleChange('solution', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[var(--app-text-muted)] mb-2 block">Traction & Key Metrics</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] min-h-[80px]"
                  placeholder="Share any traction, metrics, or milestones (users, revenue, partnerships, etc.)"
                  value={formData.traction}
                  onChange={(e) => handleChange('traction', e.target.value)}
                />
              </div>
              <Input
                label="Pitch Deck URL"
                placeholder="https://docsend.com/..."
                value={formData.pitchDeckUrl}
                onChange={(e) => handleChange('pitchDeckUrl', e.target.value)}
                startContent={<FileText className="w-4 h-4 text-[var(--app-text-subtle)]" />}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--app-border)]">
            <p className="text-xs text-[var(--app-text-subtle)]">
              * Required fields
            </p>
            <Button
              color="primary"
              size="lg"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={!formData.companyName || !formData.founderName || !formData.founderEmail || !formData.oneLiner || !formData.sector || !formData.stage || !formData.problem || !formData.solution}
            >
              Submit Application
            </Button>
          </div>
        </div>
      </Card>

      {!embedded && (
        <Card padding="md" className="mt-4 bg-[var(--app-info-bg)] border-[var(--app-info)]/20">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-[var(--app-info)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--app-info)] mb-1">Automatic Dealflow Integration</p>
              <p className="text-xs text-[var(--app-text-muted)]">
                Submissions from this form automatically populate your VestLedger dealflow pipeline in the "Sourced" stage.
                You'll receive email notifications for new applications and can configure auto-categorization rules.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
