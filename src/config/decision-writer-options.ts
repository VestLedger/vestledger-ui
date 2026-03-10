import type {
  DecisionWriterTone,
  RejectionReason,
} from "@/data/mocks/ai/decision-writer";

export const DECISION_WRITER_TONE_OPTIONS: Array<{
  value: DecisionWriterTone;
  label: string;
  description: string;
}> = [
  {
    value: "warm",
    label: "Warm & Encouraging",
    description: "Supportive and friendly",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Balanced and respectful",
  },
  {
    value: "concise",
    label: "Brief & Direct",
    description: "Short and to the point",
  },
];

export const DECISION_WRITER_REJECTION_REASONS: RejectionReason[] = [
  {
    id: "1",
    category: "market",
    label: "Market size too small",
    selected: false,
  },
  {
    id: "2",
    category: "market",
    label: "Highly competitive landscape",
    selected: false,
  },
  {
    id: "3",
    category: "market",
    label: "Market timing concerns",
    selected: false,
  },
  {
    id: "4",
    category: "team",
    label: "Team lacks domain expertise",
    selected: false,
  },
  {
    id: "5",
    category: "team",
    label: "Team composition gaps",
    selected: false,
  },
  {
    id: "6",
    category: "product",
    label: "Product-market fit unclear",
    selected: false,
  },
  {
    id: "7",
    category: "product",
    label: "Insufficient differentiation",
    selected: false,
  },
  { id: "8", category: "product", label: "Technology risk", selected: false },
  {
    id: "9",
    category: "financials",
    label: "Unit economics not compelling",
    selected: false,
  },
  {
    id: "10",
    category: "financials",
    label: "Capital requirements too high",
    selected: false,
  },
  {
    id: "11",
    category: "financials",
    label: "Valuation mismatch",
    selected: false,
  },
  { id: "12", category: "fit", label: "Outside fund thesis", selected: false },
  { id: "13", category: "fit", label: "Stage mismatch", selected: false },
  {
    id: "14",
    category: "timing",
    label: "Too early for our fund",
    selected: false,
  },
  {
    id: "15",
    category: "timing",
    label: "Portfolio capacity constraints",
    selected: false,
  },
];
