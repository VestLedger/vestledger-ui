import { beforeEach, describe, expect, it, vi } from "vitest";

const isMockMode = vi.fn(() => false);
const requestJson = vi.fn();

vi.mock("@/config/data-mode", () => ({
  isMockMode,
}));

vi.mock("@/services/shared/httpClient", () => ({
  requestJson,
}));

describe("documentsService API mode", () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(false);
    requestJson.mockReset();
  });

  it("returns an empty documents snapshot when the API request fails", async () => {
    requestJson.mockRejectedValue(new Error("network down"));

    const service = await import("@/services/documentsService");
    const snapshot = await service.listDocuments();

    expect(snapshot).toEqual({
      documents: [],
      folders: [],
    });
  });

  it("throws upload failures instead of returning mock document fallbacks", async () => {
    requestJson.mockRejectedValue(new Error("network down"));

    const service = await import("@/services/documentsService");

    await expect(service.uploadDocument()).rejects.toThrow(
      "Failed to upload document",
    );
  });
});
