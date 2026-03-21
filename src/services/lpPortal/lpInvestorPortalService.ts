import { isMockMode } from "@/config/data-mode";
import {
  mockInvestorData,
  mockReports,
  mockTransactions,
  mockDistributionStatements,
  mockUpcomingDistributions,
  mockDistributionConfirmations,
  mockDistributionElections,
  mockBankDetails,
  mockNotificationPreferences,
  mockEmailPreview,
  mockFAQItems,
  type InvestorData,
  type QuarterlyReport,
  type Transaction,
  type LPDistributionStatement,
  type LPUpcomingDistribution,
  type LPDistributionConfirmation,
  type LPDistributionElection,
  type LPBankDetails,
  type LPNotificationPreferences,
  type LPEmailPreview,
  type LPFAQItem,
} from "@/data/seeds/lp-portal/lp-investor-portal";
import { requestJson } from "@/services/shared/httpClient";
import { DEFAULT_CURRENCY } from "@/config/i18n";

export interface LPInvestorSnapshot {
  investor: InvestorData;
  reports: QuarterlyReport[];
  transactions: Transaction[];
  distributionStatements: LPDistributionStatement[];
  upcomingDistributions: LPUpcomingDistribution[];
  distributionConfirmations: LPDistributionConfirmation[];
  distributionElections: LPDistributionElection[];
  bankDetails: LPBankDetails;
  notificationPreferences: LPNotificationPreferences;
  emailPreview: LPEmailPreview;
  faqItems: LPFAQItem[];
}

type ApiInvestorSnapshot = Partial<LPInvestorSnapshot>;
type ApiInvestorSnapshotResponse =
  | ApiInvestorSnapshot
  | { data?: ApiInvestorSnapshot };

const clone = <T>(value: T): T => structuredClone(value);

let apiInvestorSnapshotCache: LPInvestorSnapshot | null = null;

function getSeedSnapshot(): LPInvestorSnapshot {
  return {
    investor: clone(mockInvestorData),
    reports: clone(mockReports),
    transactions: clone(mockTransactions),
    distributionStatements: clone(mockDistributionStatements),
    upcomingDistributions: clone(mockUpcomingDistributions),
    distributionConfirmations: clone(mockDistributionConfirmations),
    distributionElections: clone(mockDistributionElections),
    bankDetails: clone(mockBankDetails),
    notificationPreferences: clone(mockNotificationPreferences),
    emailPreview: clone(mockEmailPreview),
    faqItems: clone(mockFAQItems),
  };
}

function getEmptySnapshot(): LPInvestorSnapshot {
  return {
    investor: {
      name: "",
      fundName: "",
      commitmentAmount: 0,
      calledCapital: 0,
      distributedCapital: 0,
      navValue: 0,
      dpi: 0,
      tvpi: 0,
      rvpi: 0,
      irr: 0,
      moic: 0,
      joinDate: "",
      lastUpdate: "",
    },
    reports: [],
    transactions: [],
    distributionStatements: [],
    upcomingDistributions: [],
    distributionConfirmations: [],
    distributionElections: [],
    bankDetails: {
      accountName: "",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "checking",
      currency: DEFAULT_CURRENCY,
      country: "",
      lastUpdated: "",
      verified: false,
    },
    notificationPreferences: {
      statementReady: false,
      distributionReminders: false,
      taxDocumentAlerts: false,
      marketingUpdates: false,
      reminderDaysBefore: [],
      emailAddress: "",
    },
    emailPreview: {
      subject: "",
      body: "",
      footer: "",
    },
    faqItems: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function resolveArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeSnapshot(
  apiData: ApiInvestorSnapshot | null | undefined,
  fallback: LPInvestorSnapshot,
): LPInvestorSnapshot {
  if (!apiData) return clone(fallback);

  const investor = isRecord(apiData.investor)
    ? (apiData.investor as InvestorData)
    : fallback.investor;

  const bankDetails = isRecord(apiData.bankDetails)
    ? (apiData.bankDetails as LPBankDetails)
    : fallback.bankDetails;

  const notificationPreferences = isRecord(apiData.notificationPreferences)
    ? (apiData.notificationPreferences as LPNotificationPreferences)
    : fallback.notificationPreferences;

  const emailPreview = isRecord(apiData.emailPreview)
    ? (apiData.emailPreview as LPEmailPreview)
    : fallback.emailPreview;

  return {
    investor,
    reports: resolveArray<QuarterlyReport>(apiData.reports, fallback.reports),
    transactions: resolveArray<Transaction>(
      apiData.transactions,
      fallback.transactions,
    ),
    distributionStatements: resolveArray<LPDistributionStatement>(
      apiData.distributionStatements,
      fallback.distributionStatements,
    ),
    upcomingDistributions: resolveArray<LPUpcomingDistribution>(
      apiData.upcomingDistributions,
      fallback.upcomingDistributions,
    ),
    distributionConfirmations: resolveArray<LPDistributionConfirmation>(
      apiData.distributionConfirmations,
      fallback.distributionConfirmations,
    ),
    distributionElections: resolveArray<LPDistributionElection>(
      apiData.distributionElections,
      fallback.distributionElections,
    ),
    bankDetails,
    notificationPreferences,
    emailPreview,
    faqItems: resolveArray<LPFAQItem>(apiData.faqItems, fallback.faqItems),
  };
}

function getCachedSnapshot(): LPInvestorSnapshot {
  return clone(apiInvestorSnapshotCache ?? getEmptySnapshot());
}

export async function getInvestorSnapshot(): Promise<LPInvestorSnapshot> {
  if (isMockMode("lpPortal")) {
    if (!apiInvestorSnapshotCache) {
      apiInvestorSnapshotCache = getSeedSnapshot();
    }
    return getCachedSnapshot();
  }

  try {
    const fallback = getCachedSnapshot();
    const response = await requestJson<ApiInvestorSnapshotResponse>(
      "/lp-portal/investor-snapshot",
      {
        method: "GET",
        fallbackMessage: "Failed to fetch LP investor portal snapshot",
      },
    );

    const payload =
      isRecord(response) && "data" in response && isRecord(response.data)
        ? (response.data as ApiInvestorSnapshot)
        : (response as ApiInvestorSnapshot);

    const resolved = normalizeSnapshot(payload, fallback);
    apiInvestorSnapshotCache = clone(resolved);
    return clone(resolved);
  } catch {
    return getCachedSnapshot();
  }
}

export function clearLPInvestorSnapshotCache(): void {
  apiInvestorSnapshotCache = null;
}
