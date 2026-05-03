import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions governing your use of the VestLedger platform and services.",
  openGraph: {
    title: "Terms of Service | VestLedger",
    description: "Terms and conditions for using the VestLedger platform.",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-[var(--app-border)]">
        <div className="absolute left-[12%] top-24 h-56 w-56 rounded-full bg-[var(--marketing-glow-blue)] blur-3xl public-marketing-glow" />
        <div className="absolute right-[10%] top-36 h-44 w-44 rounded-full bg-[var(--marketing-glow-gold)] blur-3xl public-marketing-drift" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-20 sm:pt-32">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center">
              <div className="public-marketing-kicker">
                <FileText className="h-4 w-4" />
                Legal
              </div>
            </div>
            <h1
              data-public-display="true"
              className="mt-7 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl dark:text-white"
            >
              Terms of Service
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--app-text-muted)] sm:text-lg">
              Last updated: May 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="public-marketing-panel public-marketing-panel-contrast rounded-[24px] p-6 sm:p-8 lg:p-10">
            <div className="public-marketing-prose">
              <h2>Acceptance of Terms</h2>
              <p>
                By accessing or using the VestLedger platform and services
                (&quot;Services&quot;), you agree to be bound by these Terms of
                Service (&quot;Terms&quot;). If you do not agree to these Terms,
                you may not access or use the Services.
              </p>

              <h2>Description of Services</h2>
              <p>
                VestLedger provides an AI-native fund intelligence platform,
                including the Vesta AI assistant, designed to help fund
                professionals manage investments, operations, relationships, and
                compliance workflows.
              </p>

              <h2>User Accounts</h2>
              <p>
                To access certain features of the Services, you must create an
                account. You are responsible for maintaining the confidentiality
                of your account credentials and for all activities that occur
                under your account.
              </p>

              <h2>Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>
                  Use the Services for any unlawful purpose or in violation of
                  any applicable laws
                </li>
                <li>
                  Attempt to gain unauthorized access to any part of the
                  Services
                </li>
                <li>
                  Interfere with or disrupt the integrity or performance of the
                  Services
                </li>
                <li>
                  Reproduce, duplicate, copy, sell, or resell any part of the
                  Services
                </li>
              </ul>

              <h2>Intellectual Property</h2>
              <p>
                The Services and all content, features, and functionality are
                owned by VestLedger and are protected by intellectual property
                laws. Your data remains yours — VestLedger does not claim
                ownership of any content you submit through the Services.
              </p>

              <h2>Data and Privacy</h2>
              <p>
                Your use of the Services is also governed by our{" "}
                <Link
                  href="/privacy"
                  className="text-[var(--app-primary)] hover:underline"
                >
                  Privacy Policy
                </Link>
                . By using the Services, you consent to the collection and use
                of your information as described therein.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, VestLedger shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use of or inability to use
                the Services.
              </p>

              <h2>Modifications</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify you of any material changes by posting the updated Terms
                on this page and updating the &quot;Last updated&quot; date.
              </p>

              <h2>Contact</h2>
              <p>
                Questions about these Terms should be directed to{" "}
                <a
                  href="mailto:legal@vestledger.com"
                  className="text-[var(--app-primary)] hover:underline"
                >
                  legal@vestledger.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
