"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Textarea, Select } from "@/ui";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Network,
  Sparkles,
} from "lucide-react";
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
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="absolute left-[10%] top-20 h-56 w-56 rounded-full bg-[var(--marketing-glow-gold)] blur-3xl public-marketing-glow" />
        <div className="absolute right-[12%] bottom-20 h-48 w-48 rounded-full bg-[var(--marketing-glow-blue)] blur-3xl public-marketing-drift" />
        <div className="relative public-marketing-panel public-marketing-panel-contrast rounded-[28px] p-8 sm:p-10 text-center max-w-md w-full">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/35 bg-amber-100/85 text-amber-700 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-200">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h2
            data-public-display="true"
            className="public-marketing-contrast-heading mt-6 text-3xl font-semibold"
          >
            Your <span className="text-brand-gold">Vesta Journey</span> begins.
          </h2>
          <p className="public-marketing-contrast-copy mt-4">
            Thank you for reaching out. Our team will prepare to onboard your
            Vesta. Expect to hear from us within{" "}
            <span className="text-brand-gold font-semibold">24 hours</span>.
          </p>
          <div className="mt-8">
            <Link href="/" className="btn-primary rounded-full px-7">
              Return to Homepage
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute left-[6%] top-40 h-64 w-64 rounded-full bg-[var(--marketing-glow-blue)] blur-3xl public-marketing-glow" />
      <div className="absolute right-[10%] top-60 h-52 w-52 rounded-full bg-[var(--marketing-glow-gold)] blur-3xl public-marketing-drift" />
      <div className="absolute bottom-40 left-[20%] h-48 w-48 rounded-full bg-[var(--marketing-glow-cyan)] blur-3xl public-marketing-pulse" />

      <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center">
            <div className="public-marketing-kicker">
              <Sparkles className="h-4 w-4" />
              Early Access
            </div>
          </div>
          <h1
            data-public-display="true"
            className="mt-7 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white"
          >
            Meet your <span className="text-brand">Vesta.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[var(--app-text-muted)]">
            Get{" "}
            <span className="text-brand-gold font-semibold">early access</span>{" "}
            to your own AI fund assistant. We&apos;ll onboard Vesta to your fund
            and show you what intelligent fund management looks like.
          </p>
        </div>

        {/* Form Panel */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="public-marketing-panel public-marketing-panel-contrast rounded-[24px] p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  name="firstName"
                  label="First Name"
                  placeholder="Jane"
                  isRequired
                  variant="bordered"
                  classNames={{
                    inputWrapper:
                      "bg-[var(--marketing-contrast-soft-bg)] border-[var(--marketing-contrast-soft-border)] backdrop-blur-xl",
                    label: "text-[var(--marketing-contrast-text)]",
                  }}
                />
                <Input
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  isRequired
                  variant="bordered"
                  classNames={{
                    inputWrapper:
                      "bg-[var(--marketing-contrast-soft-bg)] border-[var(--marketing-contrast-soft-border)] backdrop-blur-xl",
                    label: "text-[var(--marketing-contrast-text)]",
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
                  inputWrapper:
                    "bg-[var(--marketing-contrast-soft-bg)] border-[var(--marketing-contrast-soft-border)] backdrop-blur-xl",
                  label: "text-[var(--marketing-contrast-text)]",
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  name="company"
                  label="Company / Firm Name"
                  placeholder="Acme Ventures"
                  isRequired
                  variant="bordered"
                  classNames={{
                    inputWrapper:
                      "bg-[var(--marketing-contrast-soft-bg)] border-[var(--marketing-contrast-soft-border)] backdrop-blur-xl",
                    label: "text-[var(--marketing-contrast-text)]",
                  }}
                />
                <Select
                  name="role"
                  label="Role"
                  placeholder="Select your role"
                  isRequired
                  variant="bordered"
                  classNames={{
                    trigger:
                      "bg-[var(--marketing-contrast-soft-bg)] border-[var(--marketing-contrast-soft-border)] backdrop-blur-xl",
                    label: "text-[var(--marketing-contrast-text)]",
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  name="aum"
                  label="Assets Under Management (AUM)"
                  placeholder="Select range"
                  variant="bordered"
                  classNames={{
                    trigger:
                      "bg-[var(--marketing-contrast-soft-bg)] border-[var(--marketing-contrast-soft-border)] backdrop-blur-xl",
                    label: "text-[var(--marketing-contrast-text)]",
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
                    trigger:
                      "bg-[var(--marketing-contrast-soft-bg)] border-[var(--marketing-contrast-soft-border)] backdrop-blur-xl",
                    label: "text-[var(--marketing-contrast-text)]",
                  }}
                  options={[
                    {
                      value: "early-stage",
                      label: "Early Stage (Pre-Seed/Seed)",
                    },
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
                  inputWrapper:
                    "bg-[var(--marketing-contrast-soft-bg)] border-[var(--marketing-contrast-soft-border)] backdrop-blur-xl",
                  label: "text-[var(--marketing-contrast-text)]",
                }}
              />

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full font-semibold btn-primary rounded-full"
                isLoading={loading}
              >
                {loading ? "Submitting..." : "Request Your Vesta"}
              </Button>

              <p className="text-xs text-center public-marketing-contrast-label">
                By submitting this form, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline hover:text-[var(--app-primary)]"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-[var(--app-primary)]"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>

          {/* Side panel */}
          <div className="hidden lg:block">
            <div className="public-marketing-panel public-marketing-panel-dark relative overflow-hidden rounded-[24px] p-6 sticky top-28">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.16),transparent_50%)]" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-50">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      What to expect
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      Your Vesta onboarding.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    {
                      icon: Sparkles,
                      text: "A dedicated onboarding call to understand your fund's unique needs.",
                      color: "text-amber-300",
                    },
                    {
                      icon: Network,
                      text: "Vesta learns your fund structure, relationships, and operational patterns.",
                      color: "text-cyan-300",
                    },
                    {
                      icon: Bot,
                      text: "Your AI operating layer goes live within 4–6 weeks.",
                      color: "text-blue-300",
                    },
                  ].map(({ icon: Icon, text, color }) => (
                    <div
                      key={text}
                      className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-slate-950/40 px-4 py-4"
                    >
                      <Icon
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${color}`}
                      />
                      <p className="text-sm leading-6 text-slate-200">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[18px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Response time
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Our team reviews every request personally. Expect a response
                    within{" "}
                    <span className="text-amber-300 font-semibold">
                      24 hours
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
