import { describe, it, expect } from "vitest";
import { call, put } from "redux-saga/effects";
import type { Distribution, DistributionCalendarEvent } from "@/types/distribution";
import {
  distributionsRequested,
  distributionsLoaded,
  distributionsFailed,
  calendarEventsRequested,
  calendarEventsLoaded,
  calendarEventsFailed,
} from "@/store/slices/distributionSlice";
import {
  loadDistributionsWorker,
  loadCalendarEventsWorker,
} from "@/store/sagas/distributionSaga";
import {
  fetchDistributions,
  fetchDistributionCalendarEvents,
} from "@/services/backOffice/distributionService";
import { normalizeError } from "@/store/utils/normalizeError";

describe("distributionSaga", () => {
  const mockDistribution: Distribution = {
    id: "dist-1",
    fundId: "fund-1",
    fundName: "Test Fund",
    name: "Q4 Distribution",
    eventType: "dividend",
    eventDate: "2024-12-31",
    paymentDate: "2024-12-31",
    status: "draft",
    grossProceeds: 10000000,
    totalFees: 0,
    totalExpenses: 0,
    netProceeds: 10000000,
    totalTaxWithholding: 0,
    totalDistributed: 10000000,
    feeLineItems: [],
    lpAllocations: [],
    approvalChainId: "",
    approvalSteps: [],
    statementsGenerated: false,
    statements: [],
    createdBy: "user-1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    isDraft: true,
    revisionNumber: 1,
    comments: [],
    isRecurring: false,
  };

  const mockCalendarEvent: DistributionCalendarEvent = {
    id: "event-1",
    distributionId: "dist-1",
    title: "Q4 Distribution",
    date: "2024-12-31",
    eventType: "scheduled",
    status: "upcoming",
    fundId: "fund-1",
    fundName: "Test Fund",
    isRecurring: false,
  };

  it("loadDistributionsWorker handles success", () => {
    const action = distributionsRequested({ fundId: "fund-1" });
    const generator = loadDistributionsWorker(action);
    expect(generator.next().value).toEqual(call(fetchDistributions, action.payload));
    expect(generator.next([mockDistribution]).value).toEqual(
      put(distributionsLoaded({ distributions: [mockDistribution] }))
    );
  });

  it("loadDistributionsWorker handles errors", () => {
    const action = distributionsRequested();
    const generator = loadDistributionsWorker(action);
    generator.next();
    const error = new Error("Failed to load distributions");
    expect(generator.throw(error).value).toEqual(
      put(distributionsFailed(normalizeError(error)))
    );
  });

  it("loadCalendarEventsWorker handles success", () => {
    const action = calendarEventsRequested({ startDate: "2024-12-01", endDate: "2024-12-31" });
    const generator = loadCalendarEventsWorker(action);
    expect(generator.next().value).toEqual(
      call(fetchDistributionCalendarEvents, "2024-12-01", "2024-12-31")
    );
    expect(generator.next([mockCalendarEvent]).value).toEqual(
      put(calendarEventsLoaded({ events: [mockCalendarEvent] }))
    );
  });

  it("loadCalendarEventsWorker handles errors", () => {
    const action = calendarEventsRequested();
    const generator = loadCalendarEventsWorker(action);
    generator.next();
    const error = new Error("Failed to load calendar events");
    expect(generator.throw(error).value).toEqual(
      put(calendarEventsFailed(normalizeError(error)))
    );
  });
});
