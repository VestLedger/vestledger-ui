import type { EvidenceCitation } from "./types";

/**
 * Fixture scorecard claim used to exercise the P2-006 primitives in tests
 * and storybook-like examples. Subsequent tasks (P3-018, P4-008, P4-011)
 * replace this fixture with real evidence APIs.
 */
export interface ScorecardClaimFixture {
  id: string;
  factor: string;
  claim: string;
  score: number;
  weight: number;
  citations: EvidenceCitation[];
}

export const SAMPLE_SCORECARD_CLAIM: ScorecardClaimFixture = {
  id: "score-team-001",
  factor: "Team",
  claim: "Founder previously built and exited a Series B SaaS company in 2022.",
  score: 0.82,
  weight: 0.25,
  citations: [
    {
      id: "src-crunchbase",
      source: "Crunchbase · Acquisition record",
      href: "https://crunchbase.com/example-acquisition",
      confidence: "0.88",
      freshness: "Updated 3w ago",
      snippet:
        "Acme Co acquired by ExampleCorp in 2022 for an undisclosed sum.",
    },
    {
      id: "src-linkedin",
      source: "LinkedIn · Founder timeline",
      href: "https://linkedin.com/in/example",
      confidence: "0.74",
      freshness: "Updated 6d ago",
      snippet: "Co-founder, Acme Co (2018 – 2022). Acquired by ExampleCorp.",
    },
    {
      id: "src-conversation",
      source: "Founder call · 2026-04-22",
      onOpen: () => {},
      confidence: "internal",
      freshness: "23d ago",
      snippet:
        "Confirmed in conversation. Founder cited revenue trajectory at exit.",
    },
  ],
};
