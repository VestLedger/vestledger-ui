import AboutPage from "@/components/public/about";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Building the Future of Fund Intelligence",
  description:
    "VestLedger was founded to give every fund professional an intelligent counterpart. Learn about our mission, values, and the journey behind Vesta.",
  openGraph: {
    title: "About VestLedger — Building the Future of Fund Intelligence",
    description:
      "Learn about our mission, values, and the journey behind Vesta.",
    type: "website",
  },
};

export default function About() {
  return <AboutPage />;
}
