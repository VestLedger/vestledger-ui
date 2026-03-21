import { beforeEach, describe, expect, it, vi } from "vitest";

const isMockMode = vi.fn(() => false);
const requestJson = vi.fn();

vi.mock("@/config/data-mode", () => ({
  isMockMode,
}));

vi.mock("@/services/shared/httpClient", () => ({
  requestJson,
}));

describe("integrationsService API mode", () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(false);
    requestJson.mockReset();
  });

  it("returns an empty integrations snapshot when the API request fails", async () => {
    requestJson.mockRejectedValue(new Error("network down"));

    const service = await import("@/services/integrationsService");
    const snapshot = await service.getIntegrationsSnapshot();

    expect(snapshot).toEqual({
      accounts: [],
      events: [],
      integrations: [],
    });
  });

  it("rejects live calendar creation instead of fabricating a local event", async () => {
    const service = await import("@/services/integrationsService");

    await expect(service.createCalendarEvent()).rejects.toThrow(
      "Creating calendar events in live mode requires an API implementation.",
    );
  });
});
