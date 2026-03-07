import { clearFundAnalyticsSnapshotCache } from "@/services/analytics/fundAnalyticsService";
import { clearComplianceSnapshotCache } from "@/services/backOffice/complianceService";
import { clearTaxCenterSnapshotCache } from "@/services/backOffice/taxCenterService";
import { clearValuationSnapshotCache } from "@/services/backOffice/valuation409aService";
import { clearAuditTrailCache } from "@/services/blockchain/auditTrailService";
import { clearCollaborationSnapshotCache } from "@/services/collaboration/collaborationService";
import { clearCRMSnapshotCache } from "@/services/crm/contactsService";
import { clearDocumentsSnapshotCache } from "@/services/documentsService";
import { clearIntegrationsSnapshotCache } from "@/services/integrationsService";
import { clearLPInvestorSnapshotCache } from "@/services/lpPortal/lpInvestorPortalService";
import { clearLPManagementSnapshotCache } from "@/services/lpPortal/lpManagementService";
import { clearRoleOnboardingCache } from "@/services/onboarding/roleOnboardingService";
import { clearPortfolioSnapshotCache } from "@/services/portfolio/portfolioDataService";
import { clearPortfolioDocumentsSnapshotCache } from "@/services/portfolio/portfolioDocumentsService";

export function clearAuthenticatedAppCaches(): void {
  clearFundAnalyticsSnapshotCache();
  clearComplianceSnapshotCache();
  clearTaxCenterSnapshotCache();
  clearValuationSnapshotCache();
  clearAuditTrailCache();
  clearCollaborationSnapshotCache();
  clearCRMSnapshotCache();
  clearDocumentsSnapshotCache();
  clearIntegrationsSnapshotCache();
  clearLPInvestorSnapshotCache();
  clearLPManagementSnapshotCache();
  clearRoleOnboardingCache();
  clearPortfolioSnapshotCache();
  clearPortfolioDocumentsSnapshotCache();
}
