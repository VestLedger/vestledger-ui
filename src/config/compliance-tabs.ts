import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Scale,
  ShieldCheck,
} from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const COMPLIANCE_TABS: ContextualTabConfig[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "filings", label: "Regulatory Filings", icon: FileText },
  { id: "audits", label: "Audit Schedule", icon: Scale },
  { id: "aml-kyc", label: "AML/KYC", icon: ShieldCheck },
  { id: "resources", label: "Resources", icon: BookOpen },
];

export const DEFAULT_COMPLIANCE_TAB_ID = COMPLIANCE_TABS[0]?.id ?? "overview";

export const COMPLIANCE_TAB_IDS = new Set(COMPLIANCE_TABS.map((tab) => tab.id));
