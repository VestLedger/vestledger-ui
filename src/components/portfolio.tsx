"use client";

import { useEffect } from "react";
import { PageScaffold } from "@/ui/composites";
import { Briefcase } from "lucide-react";
import { PortfolioDashboard } from "./portfolio-dashboard";
import { PortfolioDocuments } from "./portfolio-documents";
import { PortfolioUpdates } from "./portfolio-updates";
import { FundSelector } from "./fund-selector";
import { getRouteConfig, ROUTE_PATHS } from "@/config/routes";
import {
  DEFAULT_PORTFOLIO_TAB_ID,
  PORTFOLIO_TAB_IDS,
} from "@/config/portfolio-tabs";
import { useUIKey } from "@/store/ui";
import { useFund, TabFundScope } from "@/contexts/fund-context";
import { useAsyncData } from "@/hooks/useAsyncData";
import { portfolioSelectors } from "@/store/slices/portfolioSlice";
import { AsyncStateRenderer } from "@/ui/async-states";
import { loadPortfolioUpdatesOperation } from "@/store/async/dataOperations";

export function Portfolio() {
  return (
    <TabFundScope tabKey="portfolio">
      <PortfolioContent />
    </TabFundScope>
  );
}

function PortfolioContent() {
  const { value: ui, patch: patchUI } = useUIKey("portfolio", {
    selected: DEFAULT_PORTFOLIO_TAB_ID,
  });
  const { selected } = ui;
  const { selectedFund } = useFund();
  const fundId = selectedFund?.id ?? null;

  useEffect(() => {
    if (!PORTFOLIO_TAB_IDS.has(selected)) {
      patchUI({ selected: DEFAULT_PORTFOLIO_TAB_ID });
    }
  }, [patchUI, selected]);

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig(ROUTE_PATHS.portfolio);

  const { data, isLoading, error, refetch } = useAsyncData(
    loadPortfolioUpdatesOperation,
    portfolioSelectors.selectState,
    {
      params: { fundId },
      dependencies: [fundId],
    },
  );

  const pageMetrics = data?.pageMetrics ?? {
    totalCompanies: 0,
    atRiskCompanies: 0,
    pendingUpdates: 0,
  };
  const totalCompanies = pageMetrics.totalCompanies;
  const healthyCompanies = data?.healthyCompanies ?? 0;
  const atRiskCompanies = pageMetrics.atRiskCompanies;
  const pendingUpdates = pageMetrics.pendingUpdates;
  const aiSummaryText = isLoading
    ? "Refreshing portfolio metrics and updates..."
    : `${healthyCompanies}/${totalCompanies} companies performing well. ${atRiskCompanies} companies flagged for attention. ${pendingUpdates} unread portfolio updates require review.`;

  return (
    <PageScaffold
      breadcrumbs={routeConfig?.breadcrumbs}
      aiSuggestion={routeConfig?.aiSuggestion}
      header={{
        title: "Portfolio",
        description: "Track performance across your investments",
        icon: Briefcase,
        aiSummary: {
          text: aiSummaryText,
        },
        actionContent: <FundSelector />,
      }}
    >
      <AsyncStateRenderer
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loadingMessage="Loading portfolio data..."
        errorTitle="Failed to Load Portfolio"
        isEmpty={() => false}
      >
        {() => (
          <div className="mt-4">
            {selected === "overview" && <PortfolioDashboard />}
            {selected === "updates" && <PortfolioUpdates />}
            {selected === "documents" && <PortfolioDocuments />}
          </div>
        )}
      </AsyncStateRenderer>
    </PageScaffold>
  );
}
