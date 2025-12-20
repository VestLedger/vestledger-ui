'use client';

import type { FormEvent } from 'react';
import { Button, Input, Card, Textarea, Select, SelectItem } from '@/ui';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useUIKey } from '@/store/ui';
import { useAppDispatch } from '@/store/hooks';
import { eoiSubmitRequested } from '@/store/slices/uiEffectsSlice';

export default function EOIPage() {
  const dispatch = useAppDispatch();
  const { value: ui } = useUIKey<{ submitted: boolean; loading: boolean }>('public:eoi', {
    submitted: false,
    loading: false,
  });
  const { submitted, loading } = ui;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(eoiSubmitRequested());
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--app-success-bg)] text-[var(--app-success)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Request Received!</h2>
          <p className="text-[var(--app-text-muted)] mb-8">
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <Link href="/" className="inline-flex items-center gap-2 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Join the Pilot Program</h1>
        <p className="text-lg text-[var(--app-text-muted)] max-w-xl mx-auto">
          Get early access to VestLedger and help shape the future of VC operations. Limited spots available for the upcoming cohort.
        </p>
      </div>

      <Card padding="lg" className="border-[var(--app-border-subtle)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="First Name"
              placeholder="Jane"
              isRequired
              variant="bordered"
              classNames={{
               inputWrapper: "bg-[var(--app-surface-hover)] border-0"
              }}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              isRequired
              variant="bordered"
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
             classNames={{
               inputWrapper: "bg-[var(--app-surface-hover)] border-0"
              }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Company / Firm Name"
              placeholder="Acme Ventures"
              isRequired
              variant="bordered"
               classNames={{
               inputWrapper: "bg-[var(--app-surface-hover)] border-0"
              }}
            />
              <Select
              label="Role"
              placeholder="Select your role"
              isRequired
              variant="bordered"
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              label="Assets Under Management (AUM)"
              placeholder="Select range"
              variant="bordered"
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
            <Select
             label="Fund Strategy"
             placeholder="Select strategy"
             variant="bordered"
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
          </div>

          <Textarea
            label="What are your biggest operational challenges?"
            placeholder="e.g., Managing deal flow, LP reporting, messy cap tables..."
            minRows={3}
            variant="bordered"
             classNames={{
               inputWrapper: "bg-[var(--app-surface-hover)] border-0"
              }}
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-semibold"
            isLoading={loading}
          >
            {loading ? 'Submitting...' : 'Request Access'}
          </Button>
          
          <p className="text-xs text-center text-[var(--app-text-muted)]">
            By submitting this form, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </Card>
    </div>
  );
}
