"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Card, Textarea, Select } from "@/ui";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/config/env";

export default function EOIPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const payload = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      role: formData.get("role") as string,
      aum: (formData.get("aum") as string) || undefined,
      fundStrategy: (formData.get("fundStrategy") as string) || undefined,
      helpWith: (formData.get("helpWith") as string) || undefined,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/public/eoi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Submission failed. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 icon-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Your <span className="text-vesta-gold">Vesta Journey</span> Begins
          </h2>
          <p className="text-[var(--app-text-muted)] mb-8">
            Thank you for reaching out. Our team will prepare to onboard your
            Vesta. Expect to hear from us within{" "}
            <span className="text-gold font-semibold">24 hours</span>.
          </p>
          <Button as={Link} href="/" className="btn-primary">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--app-secondary-bg)] text-[var(--app-secondary)] rounded-full text-sm font-medium mb-6">
          <span>Early Access</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Meet Your <span className="text-vesta">Vesta</span>
        </h1>
        <p className="text-lg text-[var(--app-text-muted)] max-w-xl mx-auto">
          Get <span className="text-gold font-semibold">early access</span> to
          your own AI fund assistant. We&apos;ll onboard Vesta to your fund and
          show you what intelligent fund management looks like.
        </p>
      </div>

      <Card padding="lg" className="border-[var(--app-border-subtle)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              name="firstName"
              label="First Name"
              placeholder="Jane"
              isRequired
              variant="bordered"
              classNames={{
                inputWrapper: "bg-[var(--app-surface-hover)] border-0",
              }}
            />
            <Input
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              isRequired
              variant="bordered"
              classNames={{
                inputWrapper: "bg-[var(--app-surface-hover)] border-0",
              }}
            />
          </div>

          <Input
            name="email"
            label="Work Email"
            type="email"
            placeholder="jane@vc-firm.com"
            isRequired
            variant="bordered"
            classNames={{
              inputWrapper: "bg-[var(--app-surface-hover)] border-0",
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              name="company"
              label="Company / Firm Name"
              placeholder="Acme Ventures"
              isRequired
              variant="bordered"
              classNames={{
                inputWrapper: "bg-[var(--app-surface-hover)] border-0",
              }}
            />
            <Select
              name="role"
              label="Role"
              placeholder="Select your role"
              isRequired
              variant="bordered"
              classNames={{
                trigger: "bg-[var(--app-surface-hover)] border-0",
              }}
              options={[
                { value: "gp", label: "General Partner" },
                { value: "investor", label: "Investment Professional" },
                { value: "ops", label: "Operations / Platform" },
                { value: "lp", label: "Limited Partner" },
                { value: "founder", label: "Founder" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              name="aum"
              label="Assets Under Management (AUM)"
              placeholder="Select range"
              variant="bordered"
              classNames={{
                trigger: "bg-[var(--app-surface-hover)] border-0",
              }}
              options={[
                { value: "pre-fund", label: "Pre-Fund / Raising" },
                { value: "under-50m", label: "< $50M" },
                { value: "50m-200m", label: "$50M - $200M" },
                { value: "200m-1b", label: "$200M - $1B" },
                { value: "over-1b", label: "$1B+" },
              ]}
            />
            <Select
              name="fundStrategy"
              label="Fund Strategy"
              placeholder="Select strategy"
              variant="bordered"
              classNames={{
                trigger: "bg-[var(--app-surface-hover)] border-0",
              }}
              options={[
                { value: "early-stage", label: "Early Stage (Pre-Seed/Seed)" },
                { value: "venture", label: "Venture (Series A/B)" },
                { value: "growth", label: "Growth" },
                { value: "multi-stage", label: "Multi-Stage" },
              ]}
            />
          </div>

          <Textarea
            name="helpWith"
            label="What would you want Vesta to help with first?"
            placeholder="e.g., Analyzing deal flow, remembering LP preferences, automating capital calls..."
            minRows={3}
            variant="bordered"
            classNames={{
              inputWrapper: "bg-[var(--app-surface-hover)] border-0",
            }}
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold btn-primary"
            isLoading={loading}
          >
            {loading ? "Submitting..." : "Request Your Vesta"}
          </Button>

          <p className="text-xs text-center text-[var(--app-text-muted)]">
            By submitting this form, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </form>
      </Card>
    </div>
  );
}
