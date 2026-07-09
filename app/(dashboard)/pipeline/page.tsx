"use client";

import { RedesignedFrameShell } from "@/components/app-frame";
import { Pipeline } from "@/components/pipeline";

// Route-specific Vesta prompts (spec Phase 4 in-scope). Copy follows the home
// prompt style: short, operator-voiced, answerable from pipeline context.
const PIPELINE_VESTA_PROMPTS = [
  "Which deals need my attention today?",
  "Summarize pipeline movement this week",
  "What's stalled in diligence?",
];

export default function PipelinePage() {
  return (
    <RedesignedFrameShell title="Pipeline" prompts={PIPELINE_VESTA_PROMPTS}>
      <Pipeline />
    </RedesignedFrameShell>
  );
}
