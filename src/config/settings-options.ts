import type { AssignableAppRole } from '@/services/internal/teamAccessApiService';

export const LANGUAGE_OPTIONS = [
  { value: 'en-us', label: 'English (US)' },
  { value: 'en-uk', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

export const TIMEZONE_OPTIONS = [
  { value: 'pt', label: 'Pacific Time (PT)' },
  { value: 'mt', label: 'Mountain Time (MT)' },
  { value: 'ct', label: 'Central Time (CT)' },
  { value: 'et', label: 'Eastern Time (ET)' },
];

export const DATE_FORMAT_OPTIONS = [
  { value: 'mm-dd-yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd-mm-yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
];

export const CURRENCY_OPTIONS = [
  { value: 'usd', label: 'USD ($)' },
  { value: 'eur', label: 'EUR (€)' },
  { value: 'gbp', label: 'GBP (£)' },
  { value: 'jpy', label: 'JPY (¥)' },
];

export const TEAM_APP_ROLE_OPTIONS: Array<{
  value: AssignableAppRole;
  label: string;
}> = [
  { value: 'gp', label: 'GP' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'ops', label: 'Operations' },
  { value: 'ir', label: 'Investor Relations' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'lp', label: 'LP' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'strategic_partner', label: 'Strategic Partner' },
];
