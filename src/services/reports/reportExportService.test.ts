import { beforeEach, describe, expect, it, vi } from "vitest";

const isMockMode = vi.fn(() => false);
const requestJson = vi.fn();

vi.mock("@/config/data-mode", () => ({
  isMockMode,
}));

vi.mock("@/services/shared/httpClient", () => ({
  requestJson,
}));

describe("reportExportService truth state (P1-014)", () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(false);
    requestJson.mockReset();
  });

  describe("applyReportJobTruthState", () => {
    it("keeps queued/processing/failed jobs as-is with no artifact", async () => {
      const { applyReportJobTruthState } =
        await import("./reportExportService");
      for (const status of ["queued", "processing", "failed"] as const) {
        const result = applyReportJobTruthState({ status, downloadUrl: "" });
        expect(result.status).toBe(status);
        expect(result.artifactAvailable).toBe(false);
        expect(result.downloadUrl).toBeUndefined();
      }
    });

    it("marks completed + usable downloadUrl as artifactAvailable", async () => {
      const { applyReportJobTruthState } =
        await import("./reportExportService");
      const result = applyReportJobTruthState({
        status: "completed",
        downloadUrl: "https://files.example.com/r.pdf",
      });
      expect(result.status).toBe("completed");
      expect(result.artifactAvailable).toBe(true);
      expect(result.downloadUrl).toBe("https://files.example.com/r.pdf");
    });

    it.each([undefined, "", "   ", "#"])(
      "downgrades completed with placeholder downloadUrl %p",
      async (url) => {
        const { applyReportJobTruthState } =
          await import("./reportExportService");
        const result = applyReportJobTruthState({
          status: "completed",
          downloadUrl: url as string | undefined,
        });
        expect(result.status).toBe("completed_no_artifact");
        expect(result.artifactAvailable).toBe(false);
        expect(result.downloadUrl).toBeUndefined();
      },
    );
  });

  describe("getInitialExportJobs normalization", () => {
    it("applies truth state to API payloads", async () => {
      requestJson.mockResolvedValueOnce([
        {
          id: "a",
          reportName: "A",
          format: "pdf",
          status: "completed",
          progress: 100,
          downloadUrl: "https://files.example.com/a.pdf",
          createdAt: "2026-05-14T00:00:00Z",
        },
        {
          id: "b",
          reportName: "B",
          format: "pdf",
          status: "completed",
          progress: 100,
          downloadUrl: "#",
          createdAt: "2026-05-14T00:00:00Z",
        },
        {
          id: "c",
          reportName: "C",
          format: "excel",
          status: "queued",
          progress: 0,
          createdAt: "2026-05-14T00:00:00Z",
        },
      ]);
      const { getInitialExportJobs } = await import("./reportExportService");
      const jobs = await getInitialExportJobs();
      expect(jobs.map((j) => [j.id, j.status, j.artifactAvailable])).toEqual([
        ["a", "completed", true],
        ["b", "completed_no_artifact", false],
        ["c", "queued", false],
      ]);
      // downloadUrl must never be a placeholder.
      expect(jobs[1].downloadUrl).toBeUndefined();
    });

    it("does not trust client artifactAvailable when downloadUrl is missing", async () => {
      requestJson.mockResolvedValueOnce([
        {
          id: "x",
          reportName: "X",
          format: "pdf",
          status: "completed",
          progress: 100,
          artifactAvailable: true,
          createdAt: "2026-05-14T00:00:00Z",
        },
      ]);
      const { getInitialExportJobs } = await import("./reportExportService");
      const jobs = await getInitialExportJobs();
      expect(jobs[0].status).toBe("completed_no_artifact");
      expect(jobs[0].artifactAvailable).toBe(false);
    });
  });
});
