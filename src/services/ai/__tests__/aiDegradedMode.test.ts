import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DECISION_WRITER_REJECTION_REASONS,
  DECISION_WRITER_TONE_OPTIONS,
} from "@/config/decision-writer-options";

const requestJson = vi.fn();

vi.mock("@/services/shared/httpClient", () => ({
  requestJson,
}));

describe("AI services in API mode", () => {
  beforeEach(() => {
    vi.resetModules();
    requestJson.mockReset();
    window.localStorage.clear();
    document.cookie = "dataModeOverride=; Max-Age=0; path=/";
  });

  it("returns typed unavailable DD chat state and assistant reply", async () => {
    const service = await import("@/services/ai/ddChatService");

    const conversation = service.getInitialDDChatConversation({ dealId: 1 });
    expect(conversation).toMatchObject({
      ok: false,
      data_state: "unavailable",
      state_reason: "backend_not_implemented",
      feature: "ai",
      classification: "demo-only",
      source_ref: "ai/dd-chat",
      details: { service: "dd-chat", dealId: 1 },
    });
    expect(conversation.ok).toBe(false);
    if (conversation.ok) throw new Error("Expected unavailable DD chat result");
    expect(conversation.message).not.toContain("uploaded documents");

    expect(service.getDDChatAssistantResponse("Summarize risks")).toMatchObject(
      {
        role: "assistant",
        unavailable: {
          ok: false,
          data_state: "unavailable",
          state_reason: "backend_not_implemented",
        },
      },
    );
  });

  it("returns typed unavailable pitch deck analysis state outside demo mode", async () => {
    const service = await import("@/services/ai/pitchDeckService");

    expect(service.getPitchDeckAnalyses({})).toMatchObject({
      ok: false,
      data_state: "unavailable",
      state_reason: "backend_not_implemented",
      source_ref: "ai/pitch-deck-reader",
      contract: {
        permission_scope_required: true,
        tenant_scope_required: true,
        source_evidence_required: true,
        audit_event_required: true,
      },
    });
  });

  it("uses typed unavailable decision-writer state outside demo mode", async () => {
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
    expect(service.getDecisionWriterUnavailableState()).toMatchObject({
      ok: false,
      data_state: "unavailable",
      source_ref: "ai/decision-writer",
    });
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
    ).toMatchObject({
      ok: false,
      data_state: "unavailable",
      state_reason: "backend_not_implemented",
      details: {
        service: "decision-writer",
        hasCompanyName: true,
        selectedReasonCount: 0,
        hasCustomReason: false,
        tone: "warm",
      },
    });
  });

  it("returns typed unavailable badge state instead of demo badge claims", async () => {
    requestJson.mockRejectedValue(new Error("not implemented"));
    const service = await import("@/services/ai/aiBadgesService");

    await expect(service.calculateBadges()).resolves.toMatchObject({
      ok: false,
      data_state: "unavailable",
      state_reason: "provider_unavailable",
      source_ref: "GET /ai/badges",
      details: { service: "ai-badges" },
    });
  });

  it("returns typed unavailable copilot suggestions, actions, and responses", async () => {
    requestJson.mockRejectedValue(new Error("not implemented"));
    const service = await import("@/services/ai/copilotService");

    await expect(
      service.getCopilotContextualResponse("/home", "What changed?"),
    ).resolves.toMatchObject({
      ok: false,
      data_state: "unavailable",
      state_reason: "provider_unavailable",
      source_ref: "POST /ai/copilot/respond",
    });
    await expect(
      service.getCopilotSuggestionsAndActions({ pathname: "/home" }),
    ).resolves.toMatchObject({
      suggestions: [],
      quickActions: [],
      unavailable: {
        ok: false,
        data_state: "unavailable",
        state_reason: "provider_unavailable",
      },
    });
  });
});
