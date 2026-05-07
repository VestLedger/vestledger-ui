"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { useUIKey } from "@/store/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { authSelectors } from "@/store/slices/authSlice";
import { fundUISelectors } from "@/store/slices/fundSlice";
import { useFund, TabFundScope } from "@/contexts/fund-context";
import { FundSelector } from "./fund-selector";
import { getRouteConfig, ROUTE_PATHS } from "@/config/routes";
import { PageScaffold } from "@/ui/composites";
import {
  DEFAULT_FUNDS_MODULE_TAB_ID,
  FUNDS_MODULE_TAB_IDS,
} from "@/config/funds-module-tabs";

import { Analytics } from "./analytics";
import { WaterfallModeling } from "./waterfall/waterfall-modeling";
import { FundSetupList } from "./fund-admin/fund-setup-list";
import { NAVCalculator } from "./fund-admin/nav-calculator";
import { CarriedInterestTracker } from "./fund-admin/carried-interest-tracker";

import { navOpsSelectors } from "@/store/slices/navOpsSlice";
import { carryOpsSelectors } from "@/store/slices/carryOpsSlice";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  approveCarryOperation,
  calculateCarryOperation,
  calculateNAVOperation,
  distributeCarryOperation,
  exportCarryOperation,
  exportNAVOperation,
  loadCarryOperation,
  loadNAVOperation,
  publishNAVOperation,
  reviewNAVOperation,
} from "@/store/async/fundAdminOpsOperations";

type FundsModuleUIState = {
  selectedTab: string;
};

export function FundsModule() {
  return (
    <TabFundScope tabKey="funds-module">
      <FundsModuleContent />
    </TabFundScope>
  );
}

function FundsModuleContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selectedFund, viewMode } = useFund();

  const user = useAppSelector(authSelectors.selectUser);
  const visibleFunds = useAppSelector(fundUISelectors.selectVisibleFunds);

  const canMutate = user?.role === "ops" || user?.role === "gp";
  const targetFundId = viewMode === "individual" ? selectedFund?.id : undefined;

  const { value: ui, patch: patchUI } = useUIKey<FundsModuleUIState>(
    "funds-module",
    { selectedTab: DEFAULT_FUNDS_MODULE_TAB_ID },
  );
  const { selectedTab } = ui;

  useEffect(() => {
    if (!FUNDS_MODULE_TAB_IDS.has(selectedTab)) {
      patchUI({ selectedTab: DEFAULT_FUNDS_MODULE_TAB_ID });
    }
  }, [selectedTab, patchUI]);

  const { data: navData } = useAsyncData(
    loadNAVOperation,
    navOpsSelectors.selectState,
    {
      params: { fundId: targetFundId },
      dependencies: [targetFundId],
      fetchOnMount: selectedTab === "nav-calculator",
    },
  );

  const { data: carryData } = useAsyncData(
    loadCarryOperation,
    carryOpsSelectors.selectState,
    {
      params: { fundId: targetFundId },
      dependencies: [targetFundId],
      fetchOnMount: selectedTab === "carried-interest",
    },
  );

  const [fundSetupCreateSignal, setFundSetupCreateSignal] = useState(0);

  const resolveActionFund = () => {
    if (selectedFund) return selectedFund;
    return visibleFunds[0] ?? null;
  };

  const routeConfig = getRouteConfig(ROUTE_PATHS.funds);

  let primaryAction:
    | { label: string; onClick: () => void; aiSuggested?: boolean }
    | undefined;

  if (canMutate) {
    if (selectedTab === "fund-setup") {
      primaryAction = {
        label: "New Fund",
        onClick: () => setFundSetupCreateSignal((v) => v + 1),
      };
    } else if (selectedTab === "nav-calculator") {
      primaryAction = {
        label: "Recalculate NAV",
        onClick: () => {
          const fund = resolveActionFund();
          if (!fund) return;
          dispatch(
            calculateNAVOperation({ fundId: fund.id, fundName: fund.name }),
          );
        },
      };
    } else if (selectedTab === "carried-interest") {
      primaryAction = {
        label: "Recalculate Carry",
        onClick: () => {
          const fund = resolveActionFund();
          if (!fund) return;
          dispatch(
            calculateCarryOperation({ fundId: fund.id, fundName: fund.name }),
          );
        },
      };
    }
  }

  return (
    <PageScaffold
      breadcrumbs={routeConfig?.breadcrumbs}
      aiSuggestion={routeConfig?.aiSuggestion}
      containerProps={{ className: "space-y-4" }}
      toolbar={
        <div className="flex justify-end">
          <div className="w-full sm:w-64">
            <FundSelector />
          </div>
        </div>
      }
      header={{
        title: "Funds",
        description:
          "Fund-level performance, economics, waterfall modeling, and setup in one cockpit.",
        icon: Building2,
        primaryAction,
      }}
    >
      {selectedTab === "analytics" && <Analytics />}
      {selectedTab === "waterfall" && <WaterfallModeling />}
      {selectedTab === "fund-setup" && (
        <FundSetupList
          canMutate={canMutate}
          createSignal={fundSetupCreateSignal}
        />
      )}
      {selectedTab === "nav-calculator" && (
        <NAVCalculator
          calculations={navData?.calculations ?? []}
          onCalculate={
            canMutate
              ? () => {
                  const fund = resolveActionFund();
                  if (!fund) return;
                  dispatch(
                    calculateNAVOperation({
                      fundId: fund.id,
                      fundName: fund.name,
                    }),
                  );
                }
              : undefined
          }
          onReview={
            canMutate
              ? (calculationId) =>
                  dispatch(
                    reviewNAVOperation({
                      calculationId,
                      reviewedBy: user?.email ?? "ops@vestledger.ai",
                    }),
                  )
              : undefined
          }
          onPublish={
            canMutate
              ? (calculationId) =>
                  dispatch(
                    publishNAVOperation({
                      calculationId,
                      publishedBy: user?.email ?? "ops@vestledger.ai",
                    }),
                  )
              : undefined
          }
          onExport={(calculationId, format) =>
            dispatch(exportNAVOperation({ calculationId, format }))
          }
        />
      )}
      {selectedTab === "carried-interest" && (
        <CarriedInterestTracker
          terms={carryData?.terms ?? []}
          accruals={carryData?.accruals ?? []}
          onCalculateAccrual={
            canMutate
              ? (fundId) => {
                  const fund = visibleFunds.find((item) => item.id === fundId);
                  dispatch(
                    calculateCarryOperation({
                      fundId,
                      fundName: fund?.name ?? "Fund",
                    }),
                  );
                }
              : undefined
          }
          onEditTerms={
            canMutate ? () => setFundSetupCreateSignal((v) => v + 1) : undefined
          }
          onApproveAccrual={
            canMutate
              ? (accrualId) => dispatch(approveCarryOperation({ accrualId }))
              : undefined
          }
          onDistribute={
            canMutate
              ? (accrualId) => dispatch(distributeCarryOperation({ accrualId }))
              : undefined
          }
          onExport={(accrualId, format) =>
            dispatch(exportCarryOperation({ accrualId, format }))
          }
        />
      )}
    </PageScaffold>
  );
}
