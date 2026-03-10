import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DECISION_WRITER_REJECTION_REASONS,
  DECISION_WRITER_TONE_OPTIONS,
} from "@/config/decision-writer-options";

const isMockMode = vi.fn(() => false);

vi.mock("@/config/data-mode", () => ({
  isMockMode,
}));

describe("AI services in API mode", () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(false);
  });

  it("returns an empty DD chat conversation and an unavailable assistant reply", async () => {
    const service = await import("@/services/ai/ddChatService");

    expect(service.getInitialDDChatConversation({ dealId: 1 })).toEqual([]);
    expect(service.getDDChatAssistantResponse("Summarize risks")).toMatchObject(
      {
        role: "assistant",
        content:
          "AI due diligence assistant is unavailable in API mode until the backend chat integration is implemented.",
      },
    );
  });

  it("returns no pitch deck analyses outside demo mode", async () => {
    const service = await import("@/services/ai/pitchDeckService");

    expect(service.getPitchDeckAnalyses({})).toEqual([]);
  });

  it("uses empty/degraded decision-writer state outside demo mode", async () => {
    const service = await import("@/services/ai/decisionWriterService");

    expect(service.getDecisionWriterSeedDealInfo()).toEqual({
      companyName: "",
      founderName: "",
      sector: "",
      stage: "",
    });
    expect(service.getDecisionWriterRejectionReasons()).toEqual(
      DECISION_WRITER_REJECTION_REASONS,
    );
    expect(service.getDecisionWriterToneOptions()).toEqual(
      DECISION_WRITER_TONE_OPTIONS,
    );
    expect(
      service.generateRejectionLetter(
        {
          companyName: "Acme",
          founderName: "Alex",
          sector: "AI",
          stage: "Seed",
        },
        [],
        "",
        "warm",
      ),
    ).toBe(
      "Decision writer is unavailable in API mode until the backend generation workflow is implemented.",
    );
  });
});
