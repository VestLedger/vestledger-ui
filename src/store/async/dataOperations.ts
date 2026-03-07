import {
  alertsFailed,
  alertsLoaded,
  type GetAlertsParams,
} from '@/store/slices/alertsSlice';
import {
  pitchDeckAnalysesFailed,
  pitchDeckAnalysesLoaded,
  ddChatConversationFailed,
  ddChatConversationLoaded,
  type GetPitchDeckAnalysesParams,
  type GetDDChatConversationParams,
} from '@/store/slices/aiSlice';
import {
  copilotSuggestionsFailed,
  copilotSuggestionsLoaded,
  type GetCopilotSuggestionsParams,
} from '@/store/slices/copilotSlice';
import {
  type AnalystDashboardData,
  type IRDashboardData,
  type OpsDashboardData,
  analystDashboardFailed,
  analystDashboardLoaded,
  auditorDashboardFailed,
  auditorDashboardLoaded,
  irDashboardFailed,
  irDashboardLoaded,
  lpDashboardFailed,
  lpDashboardLoaded,
  opsDashboardFailed,
  opsDashboardLoaded,
  researcherDashboardFailed,
  researcherDashboardLoaded,
} from '@/store/slices/dashboardsSlice';
import {
  crmDataFailed,
  crmDataLoaded,
  type GetCRMDataParams,
} from '@/store/slices/crmSlice';
import {
  dealflowDealsFailed,
  dealflowDealsLoaded,
  type GetDealflowDealsParams,
} from '@/store/slices/dealflowSlice';
import {
  dealIntelligenceFailed,
  dealIntelligenceLoaded,
  type GetDealIntelligenceParams,
} from '@/store/slices/dealIntelligenceSlice';
import {
  documentsFailed,
  documentsLoaded,
  type GetDocumentsParams,
} from '@/store/slices/documentsSlice';
import {
  auditTrailFailed,
  auditTrailLoaded,
  collaborationFailed,
  collaborationLoaded,
  companySearchFailed,
  companySearchLoaded,
  integrationsFailed,
  integrationsLoaded,
  lpManagementFailed,
  lpManagementLoaded,
  lpPortalFailed,
  lpPortalLoaded,
} from '@/store/slices/miscSlice';
import {
  pipelineDataFailed,
  pipelineDataLoaded,
  type GetPipelineParams,
} from '@/store/slices/pipelineSlice';
import {
  portfolioUpdatesFailed,
  portfolioUpdatesLoaded,
  type PortfolioData,
  type GetPortfolioUpdatesParams,
} from '@/store/slices/portfolioSlice';
import { fetchAlerts as fetchAlertsService } from '@/services/alertsService';
import { getInitialDDChatConversation } from '@/services/ai/ddChatService';
import { getPitchDeckAnalyses } from '@/services/ai/pitchDeckService';
import {
  getCopilotSuggestionsAndActions,
} from '@/services/ai/copilotService';
import { getAuditEvents } from '@/services/blockchain/auditTrailService';
import { getCollaborationSnapshot } from '@/services/collaboration/collaborationService';
import {
  getCompanySearchCompanies,
  getCompanySearchIndustries,
  getCompanySearchStages,
} from '@/services/dealIntelligence/companySearchService';
import { getDealIntelligenceData } from '@/services/dealIntelligence/dealIntelligenceService';
import { getDealflowDeals } from '@/services/dealflow/dealflowReviewService';
import { getAnalystDashboardSnapshot } from '@/services/dashboards/analystDashboardService';
import { getAuditorDashboardSnapshot } from '@/services/dashboards/auditorDashboardService';
import { getIRDashboardSnapshot } from '@/services/dashboards/irDashboardService';
import { getLPDashboardSnapshot } from '@/services/dashboards/lpDashboardService';
import { getOpsDashboardSnapshot } from '@/services/dashboards/opsDashboardService';
import { getResearcherDashboardSnapshot } from '@/services/dashboards/researcherDashboardService';
import { listDocuments } from '@/services/documentsService';
import { getIntegrationsSnapshot } from '@/services/integrationsService';
import { getInvestorSnapshot } from '@/services/lpPortal/lpInvestorPortalService';
import { getLPManagementSnapshot } from '@/services/lpPortal/lpManagementService';
import { getPipelineData } from '@/services/pipelineService';
import { fetchPortfolioSnapshot } from '@/services/portfolio/portfolioDataService';
import { fetchPortfolioDocumentsSnapshot } from '@/services/portfolio/portfolioDocumentsService';
import {
  getCRMContacts,
  getCRMEmailAccounts,
  getCRMInteractions,
  getCRMTimelineInteractions,
} from '@/services/crm/contactsService';
import { createLatestOperation, sleep } from '@/store/async/createLatestOperation';

export const fetchAlertsOperation = createLatestOperation<GetAlertsParams | undefined, { items: Awaited<ReturnType<typeof fetchAlertsService>> }>({
  typePrefix: 'alerts/fetch',
  requestType: 'alerts/alertsRequested',
  run: async ({ arg, signal }) => {
    await sleep(300, signal);
    const items = await fetchAlertsService(arg ?? {});
    return { items };
  },
  onSuccess: (result) => alertsLoaded(result),
  onFailure: (error) => alertsFailed(error),
});

export const loadDocumentsOperation = createLatestOperation<GetDocumentsParams, Awaited<ReturnType<typeof listDocuments>>>({
  typePrefix: 'documents/load',
  requestType: 'documents/documentsRequested',
  run: async ({ arg }) => listDocuments(arg),
  onSuccess: (result) => documentsLoaded(result),
  onFailure: (error) => documentsFailed(error),
});

export const loadPipelineDataOperation = createLatestOperation<GetPipelineParams, Awaited<ReturnType<typeof getPipelineData>>>({
  typePrefix: 'pipeline/load',
  requestType: 'pipeline/pipelineDataRequested',
  run: async ({ arg }) => getPipelineData(arg),
  onSuccess: (result) => pipelineDataLoaded(result),
  onFailure: (error) => pipelineDataFailed(error),
});

export const loadDealflowDealsOperation = createLatestOperation<GetDealflowDealsParams, Awaited<ReturnType<typeof getDealflowDeals>>>({
  typePrefix: 'dealflow/load',
  requestType: 'dealflow/dealflowDealsRequested',
  run: async ({ arg }) => getDealflowDeals(arg),
  onSuccess: (deals) => dealflowDealsLoaded({ deals }),
  onFailure: (error) => dealflowDealsFailed(error),
});

export const loadDealIntelligenceOperation = createLatestOperation<GetDealIntelligenceParams, Awaited<ReturnType<typeof getDealIntelligenceData>>>({
  typePrefix: 'dealIntelligence/load',
  requestType: 'dealIntelligence/dealIntelligenceRequested',
  run: async ({ arg }) => getDealIntelligenceData(arg),
  onSuccess: (data) => dealIntelligenceLoaded(data),
  onFailure: (error) => dealIntelligenceFailed(error),
});

export const loadPortfolioUpdatesOperation = createLatestOperation<GetPortfolioUpdatesParams, PortfolioData>({
  typePrefix: 'portfolio/load',
  requestType: 'portfolio/portfolioUpdatesRequested',
  run: async ({ arg }) => {
    const fundId = arg?.fundId ?? null;
    const [snapshot, documents] = await Promise.all([
      fetchPortfolioSnapshot(fundId),
      fetchPortfolioDocumentsSnapshot(fundId),
    ]);
    return {
      ...snapshot,
      documents,
    };
  },
  onSuccess: (result) => portfolioUpdatesLoaded(result),
  onFailure: (error) => portfolioUpdatesFailed(error),
});

export const loadCRMDataOperation = createLatestOperation<GetCRMDataParams, {
  contacts: Awaited<ReturnType<typeof getCRMContacts>>;
  emailAccounts: Awaited<ReturnType<typeof getCRMEmailAccounts>>;
  interactions: Awaited<ReturnType<typeof getCRMInteractions>>;
  timelineInteractions: Awaited<ReturnType<typeof getCRMTimelineInteractions>>;
}>({
  typePrefix: 'crm/load',
  requestType: 'crm/crmDataRequested',
  run: async ({ arg }) => {
    const [contacts, emailAccounts, interactions, timelineInteractions] = await Promise.all([
      getCRMContacts(arg),
      getCRMEmailAccounts(arg),
      getCRMInteractions(arg),
      getCRMTimelineInteractions(arg),
    ]);

    return { contacts, emailAccounts, interactions, timelineInteractions };
  },
  onSuccess: (result) => crmDataLoaded(result),
  onFailure: (error) => crmDataFailed(error),
});

export const loadLPDashboardOperation = createLatestOperation<void, Awaited<ReturnType<typeof getLPDashboardSnapshot>>>({
  typePrefix: 'dashboards/lp/load',
  requestType: 'dashboards/lpDashboardRequested',
  run: async () => getLPDashboardSnapshot(),
  onSuccess: (result) => lpDashboardLoaded(result),
  onFailure: (error) => lpDashboardFailed(error),
});

export const loadAnalystDashboardOperation = createLatestOperation<void, AnalystDashboardData>({
  typePrefix: 'dashboards/analyst/load',
  requestType: 'dashboards/analystDashboardRequested',
  run: async () => getAnalystDashboardSnapshot() as Promise<AnalystDashboardData>,
  onSuccess: (result) => analystDashboardLoaded(result),
  onFailure: (error) => analystDashboardFailed(error),
});

export const loadOpsDashboardOperation = createLatestOperation<void, OpsDashboardData>({
  typePrefix: 'dashboards/ops/load',
  requestType: 'dashboards/opsDashboardRequested',
  run: async () => getOpsDashboardSnapshot() as Promise<OpsDashboardData>,
  onSuccess: (result) => opsDashboardLoaded(result),
  onFailure: (error) => opsDashboardFailed(error),
});

export const loadAuditorDashboardOperation = createLatestOperation<void, Awaited<ReturnType<typeof getAuditorDashboardSnapshot>>>({
  typePrefix: 'dashboards/auditor/load',
  requestType: 'dashboards/auditorDashboardRequested',
  run: async () => getAuditorDashboardSnapshot(),
  onSuccess: (result) => auditorDashboardLoaded(result),
  onFailure: (error) => auditorDashboardFailed(error),
});

export const loadIRDashboardOperation = createLatestOperation<void, IRDashboardData>({
  typePrefix: 'dashboards/ir/load',
  requestType: 'dashboards/irDashboardRequested',
  run: async () => getIRDashboardSnapshot() as Promise<IRDashboardData>,
  onSuccess: (result) => irDashboardLoaded(result),
  onFailure: (error) => irDashboardFailed(error),
});

export const loadResearcherDashboardOperation = createLatestOperation<void, Awaited<ReturnType<typeof getResearcherDashboardSnapshot>>>({
  typePrefix: 'dashboards/researcher/load',
  requestType: 'dashboards/researcherDashboardRequested',
  run: async () => getResearcherDashboardSnapshot(),
  onSuccess: (result) => researcherDashboardLoaded(result),
  onFailure: (error) => researcherDashboardFailed(error),
});

export const loadIntegrationsOperation = createLatestOperation<void, Awaited<ReturnType<typeof getIntegrationsSnapshot>>>({
  typePrefix: 'misc/integrations/load',
  requestType: 'misc/integrationsRequested',
  run: async () => getIntegrationsSnapshot(),
  onSuccess: (result) => integrationsLoaded(result),
  onFailure: (error) => integrationsFailed(error),
});

export const loadLPPortalOperation = createLatestOperation<void, Awaited<ReturnType<typeof getInvestorSnapshot>>>({
  typePrefix: 'misc/lpPortal/load',
  requestType: 'misc/lpPortalRequested',
  run: async () => getInvestorSnapshot(),
  onSuccess: (result) => lpPortalLoaded(result),
  onFailure: (error) => lpPortalFailed(error),
});

export const loadLPManagementOperation = createLatestOperation<void, Awaited<ReturnType<typeof getLPManagementSnapshot>>>({
  typePrefix: 'misc/lpManagement/load',
  requestType: 'misc/lpManagementRequested',
  run: async () => getLPManagementSnapshot(),
  onSuccess: (result) => lpManagementLoaded(result),
  onFailure: (error) => lpManagementFailed(error),
});

export const loadAuditTrailOperation = createLatestOperation<void, { events: Awaited<ReturnType<typeof getAuditEvents>> }>({
  typePrefix: 'misc/auditTrail/load',
  requestType: 'misc/auditTrailRequested',
  run: async () => {
    const events = await getAuditEvents();
    return { events };
  },
  onSuccess: (result) => auditTrailLoaded(result),
  onFailure: (error) => auditTrailFailed(error),
});

export const loadCompanySearchOperation = createLatestOperation<void, {
  companies: Awaited<ReturnType<typeof getCompanySearchCompanies>>;
  industries: Awaited<ReturnType<typeof getCompanySearchIndustries>>;
  stages: Awaited<ReturnType<typeof getCompanySearchStages>>;
}>({
  typePrefix: 'misc/companySearch/load',
  requestType: 'misc/companySearchRequested',
  run: async () => {
    const [companies, industries, stages] = await Promise.all([
      getCompanySearchCompanies(),
      getCompanySearchIndustries(),
      getCompanySearchStages(),
    ]);
    return { companies, industries, stages };
  },
  onSuccess: (result) => companySearchLoaded(result),
  onFailure: (error) => companySearchFailed(error),
});

export const loadCollaborationOperation = createLatestOperation<void, Awaited<ReturnType<typeof getCollaborationSnapshot>>>({
  typePrefix: 'misc/collaboration/load',
  requestType: 'misc/collaborationRequested',
  run: async () => getCollaborationSnapshot(),
  onSuccess: (result) => collaborationLoaded(result),
  onFailure: (error) => collaborationFailed(error),
});

export const loadPitchDeckAnalysesOperation = createLatestOperation<GetPitchDeckAnalysesParams, { analyses: Awaited<ReturnType<typeof getPitchDeckAnalyses>> }>({
  typePrefix: 'ai/pitchDeck/load',
  requestType: 'ai/pitchDeckAnalysesRequested',
  run: async ({ arg }) => {
    const analyses = await getPitchDeckAnalyses(arg);
    return { analyses };
  },
  onSuccess: (result) => pitchDeckAnalysesLoaded(result),
  onFailure: (error) => pitchDeckAnalysesFailed(error),
});

export const loadDDChatConversationOperation = createLatestOperation<GetDDChatConversationParams, {
  dealId: number;
  messages: Awaited<ReturnType<typeof getInitialDDChatConversation>>;
}>({
  typePrefix: 'ai/ddChat/load',
  requestType: 'ai/ddChatConversationRequested',
  run: async ({ arg }) => {
    const messages = await getInitialDDChatConversation(arg);
    return { dealId: arg.dealId, messages };
  },
  onSuccess: (result) => ddChatConversationLoaded(result),
  onFailure: (error) => ddChatConversationFailed(error),
});

export const loadCopilotSuggestionsOperation = createLatestOperation<GetCopilotSuggestionsParams, Awaited<ReturnType<typeof getCopilotSuggestionsAndActions>>>({
  typePrefix: 'copilot/suggestions/load',
  requestType: 'copilot/copilotSuggestionsRequested',
  run: async ({ arg }) => getCopilotSuggestionsAndActions(arg),
  onSuccess: (result) => copilotSuggestionsLoaded(result),
  onFailure: (error) => copilotSuggestionsFailed(error),
});
