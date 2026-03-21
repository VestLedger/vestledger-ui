import { PublicHeaderStatic } from "@/components/public/public-header-static";
import { PublicFooter } from "@/components/public/public-footer";
import type { Metadata, Viewport } from "next";
import { CANONICAL_PUBLIC_WEB_URL } from "@/config/env";
import { Manrope, Space_Grotesk } from "next/font/google";

const publicBodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-public-body",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const publicDisplayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-public-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const metadataBase = CANONICAL_PUBLIC_WEB_URL
  ? new URL(CANONICAL_PUBLIC_WEB_URL)
  : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "VestLedger - AI-Native Fund Intelligence",
    template: "%s | VestLedger",
  },
  description:
    "Meet Vesta. Your personal AI for fund management. VestLedger gives every fund professional an intelligent assistant to analyze, remember, and act.",
  keywords: [
    "AI fund management",
    "fund intelligence",
    "Vesta AI",
    "VC AI assistant",
    "LP management",
    "fund operations AI",
    "venture capital",
    "private equity",
  ],
  authors: [{ name: "VestLedger" }],
  creator: "VestLedger",
  publisher: "VestLedger",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "VestLedger",
    title: "VestLedger - Meet Vesta, Your AI Fund Partner",
    description:
      "AI-native fund intelligence. Every fund professional gets an intelligent assistant to analyze faster, remember everything, and act proactively.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VestLedger - Meet Vesta, Your AI Fund Partner",
    description:
      "AI-native fund intelligence. Every fund professional gets an intelligent assistant to analyze faster, remember everything, and act proactively.",
    creator: "@vestledger",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${publicBodyFont.variable} ${publicDisplayFont.variable} public-marketing public-marketing-shell min-h-screen flex flex-col bg-[var(--app-bg)] text-[var(--app-text)]`}
    >
      <PublicHeaderStatic />
      <main className="public-marketing-main flex-grow">{children}</main>
      <PublicFooter />
    </div>
  );
}
