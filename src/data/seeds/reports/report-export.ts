export interface ReportTemplate {
  id: string;
  name: string;
  type: "quarterly" | "annual" | "custom" | "monthly";
  description: string;
  format: "pdf" | "excel" | "csv" | "ppt";
  sections: string[];
  estimatedPages?: number;
}

/**
 * Export job shape (P1-014).
 *
 * `status === "completed"` is reserved for jobs whose artifact is actually
 * downloadable (a real `downloadUrl` is present). A job that finished
 * without producing an artifact uses `"completed_no_artifact"`. The derived
 * `artifactAvailable` flag is the authoritative signal the UI uses to
 * decide whether to render a download affordance.
 */
export interface ExportJob {
  id: string;
  templateId?: string;
  reportName: string;
  format: string;
  status:
    | "queued"
    | "processing"
    | "completed"
    | "completed_no_artifact"
    | "failed";
  progress: number;
  createdAt: string;
  downloadUrl?: string;
  artifactAvailable?: boolean;
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: "1",
    name: "Quarterly LP Report",
    type: "quarterly",
    description:
      "Comprehensive quarterly report for Limited Partners with fund performance, portfolio updates, and financial statements",
    format: "pdf",
    sections: [
      "Executive Summary",
      "Fund Performance",
      "Portfolio Companies",
      "Financials",
      "Pipeline",
    ],
    estimatedPages: 25,
  },
  {
    id: "2",
    name: "Annual Fund Report",
    type: "annual",
    description:
      "Complete annual overview including full year performance, all portfolio activity, and detailed analytics",
    format: "pdf",
    sections: [
      "Year in Review",
      "Performance Metrics",
      "Portfolio Deep Dive",
      "Market Analysis",
      "Looking Ahead",
    ],
    estimatedPages: 50,
  },
  {
    id: "3",
    name: "Portfolio Dashboard Export",
    type: "custom",
    description:
      "Export current portfolio data including metrics, valuations, and company details",
    format: "excel",
    sections: ["Company List", "Metrics", "Valuations", "Ownership", "Returns"],
  },
  {
    id: "4",
    name: "Deal Pipeline Report",
    type: "custom",
    description:
      "Current dealflow pipeline with company details, stages, and scoring",
    format: "excel",
    sections: ["Active Deals", "Sourcing", "Due Diligence", "Scoring"],
  },
  {
    id: "5",
    name: "Fund Performance Deck",
    type: "quarterly",
    description:
      "Presentation-ready performance deck for board meetings and LP updates",
    format: "ppt",
    sections: [
      "Key Metrics",
      "Portfolio Highlights",
      "Recent Activity",
      "Market Insights",
    ],
    estimatedPages: 15,
  },
  {
    id: "6",
    name: "Cap Table Export",
    type: "custom",
    description:
      "Detailed capitalization table with all shareholders, share classes, and ownership percentages",
    format: "excel",
    sections: ["Shareholders", "Share Classes", "Vesting", "Dilution Analysis"],
  },
];

export const mockExportJobs: ExportJob[] = [
  {
    id: "1",
    reportName: "Q3 2024 LP Report",
    format: "PDF",
    status: "completed",
    progress: 100,
    createdAt: "2024-11-28T14:30:00",
    downloadUrl: "/demo-artifacts/q3-2024-lp-report.pdf",
    artifactAvailable: true,
  },
  {
    // Demo-mode example of the P1-014 "completed but no artifact" truth state.
    // Surfaces the UI affordance that finished jobs without files do not
    // present a download button.
    id: "2",
    reportName: "Portfolio Dashboard",
    format: "Excel",
    status: "completed_no_artifact",
    progress: 100,
    createdAt: "2024-11-27T10:15:00",
    artifactAvailable: false,
  },
  {
    id: "3",
    reportName: "Deal Pipeline Report",
    format: "Excel",
    status: "processing",
    progress: 65,
    createdAt: "2024-11-28T16:45:00",
    artifactAvailable: false,
  },
];
