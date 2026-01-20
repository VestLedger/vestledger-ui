import type { StatementTemplate } from "@/types/distribution";

export const ILPA_CHECKLIST_ITEMS = [
  "Capital account summary and net IRR",
  "Distribution waterfall detail",
  "Fees, expenses, and carry disclosures",
  "Tax form references (K-1 or 1099)",
] as const;

export type IlpaChecklistItem = (typeof ILPA_CHECKLIST_ITEMS)[number];

export const STATEMENT_TEMPLATE_OPTIONS: Array<{
  value: StatementTemplate;
  label: string;
}> = [
  { value: "standard", label: "Standard" },
  { value: "ilpa-compliant", label: "ILPA Compliant" },
  { value: "custom", label: "Custom" },
];

export const STATEMENT_TEMPLATE_LABELS = STATEMENT_TEMPLATE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<StatementTemplate, string>
);

export const getStatementTemplateLabel = (template: StatementTemplate) =>
  STATEMENT_TEMPLATE_LABELS[template] ?? template;
