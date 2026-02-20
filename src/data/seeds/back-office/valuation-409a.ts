export interface Valuation409A {
  id: string;
  company: string;
  valuationDate: string;
  expirationDate: string;
  fairMarketValue: number;
  commonStock: number;
  preferredStock: number;
  status: 'current' | 'expiring-soon' | 'expired';
  provider: string;
  reportUrl: string;
  methodology: string;
}

export interface StrikePrice {
  id: string;
  grantDate: string;
  strikePrice: number;
  sharesGranted: number;
  recipient: string;
  vestingSchedule: string;
  status: 'active' | 'exercised' | 'expired';
}

export interface ValuationHistory {
  id: string;
  date: string;
  fmv: number;
  change: number;
  trigger: string;
}

export const mockValuations: Valuation409A[] = [
  {
    id: '1',
    company: 'CloudScale Inc.',
    valuationDate: '2024-09-15',
    expirationDate: '2025-09-15',
    fairMarketValue: 12.50,
    commonStock: 12.50,
    preferredStock: 28.75,
    status: 'current',
    provider: 'Aranca Valuation',
    reportUrl: '#',
    methodology: 'OPM (Option Pricing Model)',
  },
  {
    id: '2',
    company: 'DataFlow Systems',
    valuationDate: '2024-11-01',
    expirationDate: '2025-11-01',
    fairMarketValue: 8.25,
    commonStock: 8.25,
    preferredStock: 18.50,
    status: 'current',
    provider: 'Carta Valuation Services',
    reportUrl: '#',
    methodology: 'PWERM (Probability-Weighted Expected Return)',
  },
  {
    id: '3',
    company: 'FinTech Solutions',
    valuationDate: '2024-03-20',
    expirationDate: '2025-03-20',
    fairMarketValue: 15.75,
    commonStock: 15.75,
    preferredStock: 32.00,
    status: 'expiring-soon',
    provider: 'RSM Valuation',
    reportUrl: '#',
    methodology: 'Hybrid (OPM + Market)',
  },
];

export const mockStrikePrices: StrikePrice[] = [
  {
    id: '1',
    grantDate: '2024-10-01',
    strikePrice: 12.50,
    sharesGranted: 50000,
    recipient: 'Sarah Johnson (CTO)',
    vestingSchedule: '4-year, 1-year cliff',
    status: 'active',
  },
  {
    id: '2',
    grantDate: '2024-10-15',
    strikePrice: 12.50,
    sharesGranted: 25000,
    recipient: 'Michael Chen (VP Engineering)',
    vestingSchedule: '4-year, 1-year cliff',
    status: 'active',
  },
  {
    id: '3',
    grantDate: '2024-11-05',
    strikePrice: 8.25,
    sharesGranted: 30000,
    recipient: 'Emily Rodriguez (Head of Product)',
    vestingSchedule: '4-year, 1-year cliff',
    status: 'active',
  },
];

export const mockHistory: ValuationHistory[] = [
  {
    id: '1',
    date: '2024-11-01',
    fmv: 8.25,
    change: 0,
    trigger: 'Annual refresh',
  },
  {
    id: '2',
    date: '2024-09-15',
    fmv: 12.50,
    change: 25.0,
    trigger: 'Series B funding ($25M)',
  },
  {
    id: '3',
    date: '2024-03-20',
    fmv: 15.75,
    change: 57.5,
    trigger: 'Material event - new revenue milestone',
  },
  {
    id: '4',
    date: '2023-09-10',
    fmv: 10.00,
    change: 42.9,
    trigger: 'Series A funding ($10M)',
  },
];

