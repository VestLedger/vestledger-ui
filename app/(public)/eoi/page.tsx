'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button, Input, Textarea, Select } from '@/ui';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useUIKey } from '@/store/ui';
import { useAppDispatch } from '@/store/hooks';
import { eoiSubmitRequested } from '@/store/slices/uiEffectsSlice';
import { WorkflowFlow } from '@/components/public/visuals';

export default function EOIPage() {
  const dispatch = useAppDispatch();
  const { value: ui } = useUIKey<{ submitted: boolean; loading: boolean }>('public:eoi', {
    submitted: false,
    loading: false,
  });
  const { submitted, loading } = ui;
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
    aum: '',
    strategy: '',
    challenges: '',
  });

  const showDetails = Boolean(formValues.email && formValues.company);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(eoiSubmitRequested());
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--app-success-bg)] text-[var(--app-success)] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Request Received!</h2>
          <p className="text-[var(--app-text-muted)] mb-6">
            Thank you for your interest in VestLedger. Our team will review your application and get back to you within 24 hours.
          </p>
          <Button as={Link} href="/" color="primary">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="grid lg:grid-cols-[0.6fr_0.4fr] gap-6 items-start">
        <div>
          <div className="text-left mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Request Demo Access</h1>
            <p className="text-lg text-[var(--app-text-muted)] max-w-xl">
              Share a few details and we&apos;ll set up a pilot tailored to your fund&apos;s operations.
            </p>
          </div>

          <div className="border-t border-[var(--app-border)] pt-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="First Name"
                  placeholder="Jane"
                  isRequired
                  variant="bordered"
                  value={formValues.firstName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, firstName: e.target.value }))}
                  classNames={{
                    inputWrapper: "bg-[var(--app-surface-hover)] border-0"
                  }}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  isRequired
                  variant="bordered"
                  value={formValues.lastName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, lastName: e.target.value }))}
                  classNames={{
                    inputWrapper: "bg-[var(--app-surface-hover)] border-0"
                  }}
                />
              </div>

              <Input
                label="Work Email"
                type="email"
                placeholder="jane@vc-firm.com"
                isRequired
                variant="bordered"
                value={formValues.email}
                onChange={(e) => setFormValues((prev) => ({ ...prev, email: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-[var(--app-surface-hover)] border-0"
                }}
              />

              <Input
                label="Company / Firm Name"
                placeholder="Acme Ventures"
                isRequired
                variant="bordered"
                value={formValues.company}
                onChange={(e) => setFormValues((prev) => ({ ...prev, company: e.target.value }))}
                classNames={{
                  inputWrapper: "bg-[var(--app-surface-hover)] border-0"
                }}
              />

              {showDetails && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                      label="Role"
                      placeholder="Select your role"
                      isRequired
                      variant="bordered"
                      selectedKeys={formValues.role ? new Set([formValues.role]) : new Set()}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, role: e.target.value }))}
                      classNames={{
                        trigger: "bg-[var(--app-surface-hover)] border-0"
                      }}
                      options={[
                        { value: 'gp', label: 'General Partner' },
                        { value: 'investor', label: 'Investment Professional' },
                        { value: 'ops', label: 'Operations / Platform' },
                        { value: 'lp', label: 'Limited Partner' },
                        { value: 'founder', label: 'Founder' },
                        { value: 'other', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="Assets Under Management (AUM)"
                      placeholder="Select range"
                      variant="bordered"
                      selectedKeys={formValues.aum ? new Set([formValues.aum]) : new Set()}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, aum: e.target.value }))}
                      classNames={{
                        trigger: "bg-[var(--app-surface-hover)] border-0"
                      }}
                      options={[
                        { value: 'pre-fund', label: 'Pre-Fund / Raising' },
                        { value: 'under-50m', label: '< $50M' },
                        { value: '50m-200m', label: '$50M - $200M' },
                        { value: '200m-1b', label: '$200M - $1B' },
                        { value: 'over-1b', label: '$1B+' },
                      ]}
                    />
                  </div>

                  <Select
                    label="Fund Strategy"
                    placeholder="Select strategy"
                    variant="bordered"
                    selectedKeys={formValues.strategy ? new Set([formValues.strategy]) : new Set()}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, strategy: e.target.value }))}
                    classNames={{
                      trigger: "bg-[var(--app-surface-hover)] border-0"
                    }}
                    options={[
                      { value: 'early-stage', label: 'Early Stage (Pre-Seed/Seed)' },
                      { value: 'venture', label: 'Venture (Series A/B)' },
                      { value: 'growth', label: 'Growth' },
                      { value: 'multi-stage', label: 'Multi-Stage' },
                    ]}
                  />

                  <Textarea
                    label="What are your biggest operational challenges?"
                    placeholder="e.g., Managing deal flow, LP reporting, messy cap tables..."
                    minRows={3}
                    variant="bordered"
                    value={formValues.challenges}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, challenges: e.target.value }))}
                    classNames={{
                      inputWrapper: "bg-[var(--app-surface-hover)] border-0"
                    }}
                  />
                </>
              )}

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-semibold"
                isLoading={loading}
              >
                {loading ? 'Submitting...' : 'Request Demo'}
              </Button>

              <p className="text-xs text-center text-[var(--app-text-muted)]">
                By submitting this form, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>

        <div className="border-t border-[var(--app-border)] pt-5">
          <WorkflowFlow className="w-full h-24 mb-5" />
          <h2 className="text-xl font-semibold mb-3">What happens next</h2>
          <ul className="space-y-3 text-sm text-[var(--app-text-muted)]">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[var(--app-success)] mt-0.5" />
              <span>We review your request within 24 hours.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[var(--app-success)] mt-0.5" />
              <span>We schedule a 30-minute discovery call.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[var(--app-success)] mt-0.5" />
              <span>We design a pilot plan tailored to your fund.</span>
            </li>
          </ul>
          <div className="mt-5 text-sm text-[var(--app-primary)]">
            Limited pilot spots available each quarter.
          </div>
        </div>
      </div>
    </div>
  );
}
