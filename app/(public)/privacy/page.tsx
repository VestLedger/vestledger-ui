import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how VestLedger collects, uses, and protects your personal information.",
  openGraph: {
    title: "Privacy Policy | VestLedger",
    description:
      "Learn how VestLedger collects, uses, and protects your personal information.",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-[var(--app-border)]">
        <div className="absolute left-[10%] top-24 h-56 w-56 rounded-full bg-[var(--marketing-glow-cyan)] blur-3xl public-marketing-glow" />
        <div className="absolute right-[14%] top-32 h-44 w-44 rounded-full bg-[var(--marketing-glow-blue)] blur-3xl public-marketing-drift" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-20 sm:pt-32">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center">
              <div className="public-marketing-kicker">
                <Shield className="h-4 w-4" />
                Legal
              </div>
            </div>
            <h1
              data-public-display="true"
              className="mt-7 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl dark:text-white"
            >
              Privacy Policy
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
              <h2>Introduction</h2>
              <p>
                VestLedger (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
                is committed to protecting the privacy of our users. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our platform and
                services.
              </p>

              <h2>Information We Collect</h2>
              <h3>Information You Provide</h3>
              <p>
                We collect information that you voluntarily provide when using
                our services, including:
              </p>
              <ul>
                <li>Account registration details (name, email, company)</li>
                <li>Fund and portfolio information</li>
                <li>Communications with our team</li>
                <li>Expression of interest form submissions</li>
              </ul>

              <h3>Information Collected Automatically</h3>
              <p>
                When you access our platform, we may automatically collect
                certain information, including:
              </p>
              <ul>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage patterns and preferences</li>
                <li>Log data and analytics</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>
                  Monitor and analyze trends, usage, and activities in
                  connection with our services
                </li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. This includes
                AES-256 encryption for data at rest and TLS 1.3 for data in
                transit.
              </p>

              <h2>Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to
                fulfill the purposes for which it was collected, comply with
                legal obligations, resolve disputes, and enforce our agreements.
              </p>

              <h2>Your Rights</h2>
              <p>
                Depending on your jurisdiction, you may have the right to
                access, correct, delete, or port your personal data. You may
                also have the right to object to or restrict certain processing
                of your data.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data
                practices, please contact us at{" "}
                <a
                  href="mailto:privacy@vestledger.com"
                  className="text-[var(--app-primary)] hover:underline"
                >
                  privacy@vestledger.com
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
