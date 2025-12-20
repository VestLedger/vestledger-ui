/**
 * Centralized UI state persistence keys
 * Prevents key collisions and ensures namespacing
 */
export const UI_STATE_KEYS = {
  // Navigation
  NAV_EXPANDED_GROUPS: 'vestledger-nav-expanded-groups',
  SIDEBAR_LEFT: 'vestledger-sidebar-left-collapsed',
  SIDEBAR_RIGHT: 'vestledger-sidebar-right-collapsed',

  // Fund selection
  SELECTED_FUND_ID: 'vestledger-selected-fund-id',
  FUND_VIEW_MODE: 'vestledger-fund-view-mode',

  // Authentication
  AUTH_AUTHENTICATED: 'vestledger-auth-authenticated',
  AUTH_USER: 'vestledger-auth-user',

  // Component-specific UI state
  TOPBAR: 'topbar',
  DEAL_INTELLIGENCE: 'deal-intelligence',
  PORTFOLIO_UPDATES: 'portfolio-updates',
  PIPELINE: 'pipeline',
  DEALFLOW_REVIEW: 'dealflow-review',
} as const;

/**
 * Default UI state objects for components
 * Prevents recreating defaults inline
 */
export const UI_STATE_DEFAULTS = {
  topbar: {
    isProfileOpen: false,
    searchQuery: '',
    isSearchFocused: false,
  },

  dealIntelligence: {
    selectedDeal: null as any,
    selectedCategory: 'all',
    searchQuery: '',
    viewMode: 'fund-level' as 'fund-level' | 'per-deal',
    selectedDetailTab: 'overview' as 'overview' | 'analytics' | 'documents' | 'analysis' | 'ic-materials',
  },

  portfolioUpdates: {
    selectedType: 'all',
    searchQuery: '',
  },

  dealflowReview: {
    selectedDealId: null as string | null,
    currentSlideIndex: 0,
  },
};
