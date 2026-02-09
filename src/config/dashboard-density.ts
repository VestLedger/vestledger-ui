export type DashboardDensityMode = 'compact' | 'comfortable';

export interface DashboardDensityScale {
  mode: DashboardDensityMode;
  shell: {
    topBarHeightPx: number;
    leftSidebarExpandedWidthPx: number;
    leftSidebarCollapsedWidthPx: number;
    rightSidebarWidthPx: number;
    topbarPaddingClass: string;
    sidebarHeaderPaddingClass: string;
    sidebarNavPaddingClass: string;
    sidebarNavGapClass: string;
    copilotSectionPaddingClass: string;
    copilotInputPaddingClass: string;
  };
  page: {
    containerPaddingClass: string;
    sectionStackClass: string;
    blockGapClass: string;
  };
  header: {
    wrapperMarginClass: string;
    titleRowMarginClass: string;
    titleRowGapClass: string;
    iconContainerClass: string;
    iconSizeClass: string;
    titleClass: string;
    descriptionClass: string;
    actionGapClass: string;
    badgesContainerClass: string;
    tabsListGapClass: string;
    tabsHeightClass: string;
    tabsContentClass: string;
  };
  cardPadding: {
    none: string;
    sm: string;
    md: string;
    lg: string;
  };
  metrics: {
    gridGapClass: string;
    valueClass: string;
    headerGapClass: string;
  };
  table: {
    headerCellClass: string;
    bodyCellClass: string;
  };
  spacer: {
    pageBottomClass: string;
  };
}

export const DEFAULT_DASHBOARD_DENSITY: DashboardDensityMode = 'compact';

export const DASHBOARD_DENSITY: Record<DashboardDensityMode, DashboardDensityScale> = {
  compact: {
    mode: 'compact',
    shell: {
      topBarHeightPx: 60,
      leftSidebarExpandedWidthPx: 224,
      leftSidebarCollapsedWidthPx: 64,
      rightSidebarWidthPx: 320,
      topbarPaddingClass: 'px-3 sm:px-4',
      sidebarHeaderPaddingClass: 'px-3',
      sidebarNavPaddingClass: 'p-3',
      sidebarNavGapClass: 'space-y-3',
      copilotSectionPaddingClass: 'p-3',
      copilotInputPaddingClass: 'p-4',
    },
    page: {
      containerPaddingClass: 'p-3 sm:p-4 lg:p-6',
      sectionStackClass: 'space-y-5',
      blockGapClass: 'gap-4',
    },
    header: {
      wrapperMarginClass: 'mb-6',
      titleRowMarginClass: 'mb-3',
      titleRowGapClass: 'gap-3',
      iconContainerClass: 'p-2.5 rounded-lg',
      iconSizeClass: 'w-5 h-5',
      titleClass: 'text-2xl lg:text-[28px] font-bold text-[var(--app-text)]',
      descriptionClass: 'text-sm text-[var(--app-text-muted)]',
      actionGapClass: 'gap-2',
      badgesContainerClass: 'flex flex-wrap items-center gap-2 mt-3',
      tabsListGapClass: 'gap-4',
      tabsHeightClass: 'h-11',
      tabsContentClass: 'group-data-[selected=true]:text-[var(--app-primary)] text-[var(--app-text-muted)] font-medium text-sm',
    },
    cardPadding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
    metrics: {
      gridGapClass: 'grid gap-3 sm:gap-4',
      valueClass: 'text-2xl sm:text-[26px] leading-tight mb-1',
      headerGapClass: 'mb-3',
    },
    table: {
      headerCellClass: 'py-2.5 px-3',
      bodyCellClass: 'py-2.5 px-3',
    },
    spacer: {
      pageBottomClass: 'h-6',
    },
  },
  comfortable: {
    mode: 'comfortable',
    shell: {
      topBarHeightPx: 69,
      leftSidebarExpandedWidthPx: 256,
      leftSidebarCollapsedWidthPx: 64,
      rightSidebarWidthPx: 384,
      topbarPaddingClass: 'px-4 sm:px-6',
      sidebarHeaderPaddingClass: 'px-4',
      sidebarNavPaddingClass: 'p-4',
      sidebarNavGapClass: 'space-y-4',
      copilotSectionPaddingClass: 'p-4',
      copilotInputPaddingClass: 'p-8',
    },
    page: {
      containerPaddingClass: 'p-4 sm:p-6 lg:p-8',
      sectionStackClass: 'space-y-6',
      blockGapClass: 'gap-6',
    },
    header: {
      wrapperMarginClass: 'mb-8',
      titleRowMarginClass: 'mb-4',
      titleRowGapClass: 'gap-4',
      iconContainerClass: 'p-3 rounded-xl',
      iconSizeClass: 'w-6 h-6',
      titleClass: 'text-3xl font-bold text-[var(--app-text)]',
      descriptionClass: 'text-base text-[var(--app-text-muted)]',
      actionGapClass: 'gap-3',
      badgesContainerClass: 'flex flex-wrap items-center gap-3 mt-4',
      tabsListGapClass: 'gap-6',
      tabsHeightClass: 'h-14',
      tabsContentClass: 'group-data-[selected=true]:text-[var(--app-primary)] text-[var(--app-text-muted)] font-medium',
    },
    cardPadding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    metrics: {
      gridGapClass: 'grid gap-4',
      valueClass: 'text-3xl mb-1',
      headerGapClass: 'mb-4',
    },
    table: {
      headerCellClass: 'py-3 px-4',
      bodyCellClass: 'py-3 px-4',
    },
    spacer: {
      pageBottomClass: 'h-8',
    },
  },
};

export function resolveDashboardDensityMode(value: unknown): DashboardDensityMode {
  return value === 'comfortable' || value === 'compact'
    ? value
    : DEFAULT_DASHBOARD_DENSITY;
}

