export type IntegrationIcon = 'calendar' | 'email' | 'slack' | 'github';
export type IntegrationStatus = 'connected' | 'available' | 'coming-soon';
export type IntegrationCategory = 'productivity' | 'communication' | 'development' | 'finance';

export interface IntegrationSummary {
  id: string;
  name: string;
  description: string;
  icon: IntegrationIcon;
  status: IntegrationStatus;
  category: IntegrationCategory;
}

