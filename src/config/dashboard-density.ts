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
      containerPaddingClass: 'p-2 sm:p-3 lg:p-4',
      sectionStackClass: 'space-y-4',
      blockGapClass: 'gap-3',
    },
    header: {
      wrapperMarginClass: 'mb-4',
      titleRowMarginClass: 'mb-2',
      titleRowGapClass: 'gap-2',
      iconContainerClass: 'p-2 rounded-lg',
      iconSizeClass: 'w-5 h-5',
      titleClass: 'text-2xl lg:text-[28px] font-bold text-[var(--app-text)]',
      descriptionClass: 'text-sm text-[var(--app-text-muted)]',
      actionGapClass: 'gap-2',
      badgesContainerClass: 'flex flex-wrap items-center gap-2 mt-2',
      tabsListGapClass: 'gap-3',
      tabsHeightClass: 'h-10',
      tabsContentClass: 'group-data-[selected=true]:text-[var(--app-primary)] text-[var(--app-text-muted)] font-medium text-sm',
    },
    cardPadding: {
      none: 'p-0',
      sm: 'p-2.5',
      md: 'p-3',
      lg: 'p-4',
    },
    metrics: {
      gridGapClass: 'grid gap-2.5 sm:gap-3',
      valueClass: 'text-2xl sm:text-[26px] leading-tight mb-0.5',
      headerGapClass: 'mb-2',
    },
    table: {
      headerCellClass: 'py-2 px-2.5',
      bodyCellClass: 'py-2 px-2.5',
    },
    spacer: {
      pageBottomClass: 'h-4',
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
      containerPaddingClass: 'p-3 sm:p-4 lg:p-6',
      sectionStackClass: 'space-y-5',
      blockGapClass: 'gap-5',
    },
    header: {
      wrapperMarginClass: 'mb-6',
      titleRowMarginClass: 'mb-3',
      titleRowGapClass: 'gap-3',
      iconContainerClass: 'p-2.5 rounded-xl',
      iconSizeClass: 'w-6 h-6',
      titleClass: 'text-3xl font-bold text-[var(--app-text)]',
      descriptionClass: 'text-base text-[var(--app-text-muted)]',
      actionGapClass: 'gap-2',
      badgesContainerClass: 'flex flex-wrap items-center gap-2 mt-3',
      tabsListGapClass: 'gap-4',
      tabsHeightClass: 'h-12',
      tabsContentClass: 'group-data-[selected=true]:text-[var(--app-primary)] text-[var(--app-text-muted)] font-medium',
    },
    cardPadding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
    metrics: {
      gridGapClass: 'grid gap-3',
      valueClass: 'text-3xl mb-0.5',
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
};

export function resolveDashboardDensityMode(value: unknown): DashboardDensityMode {
  return value === 'comfortable' || value === 'compact'
    ? value
    : DEFAULT_DASHBOARD_DENSITY;
}
