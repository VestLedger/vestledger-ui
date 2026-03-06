import type {
  FundRegulatoryRegime,
  OperatingRegion,
} from '@/types/regulatory';

export const OPERATING_REGION_OPTIONS: Array<{
  value: OperatingRegion;
  label: string;
  description: string;
}> = [
  {
    value: 'india',
    label: 'India',
    description: 'SEBI AIF workflows and India-first fund operations',
  },
  {
    value: 'eu',
    label: 'European Union',
    description: 'AIFMD-style workflows and EU reporting surfaces',
  },
  {
    value: 'us',
    label: 'United States',
    description: 'US private-fund workflows, tax reporting, and valuations',
  },
];

export const FUND_REGIME_OPTIONS: Array<{
  value: FundRegulatoryRegime;
  label: string;
  region: OperatingRegion;
}> = [
  { value: 'india_sebi_aif', label: 'India SEBI AIF', region: 'india' },
  { value: 'eu_aifmd', label: 'EU AIFMD Fund', region: 'eu' },
  { value: 'us_private_fund', label: 'US Private Fund', region: 'us' },
];

export function getDefaultFundRegulatoryRegime(
  region?: OperatingRegion | null,
): FundRegulatoryRegime | null {
  switch (region) {
    case 'india':
      return 'india_sebi_aif';
    case 'eu':
      return 'eu_aifmd';
    case 'us':
      return 'us_private_fund';
    default:
      return null;
  }
}

export function getOperatingRegionLabel(region?: OperatingRegion | null) {
  return (
    OPERATING_REGION_OPTIONS.find((option) => option.value === region)?.label ??
    'Not configured'
  );
}

export function getFundRegimeLabel(regime?: FundRegulatoryRegime | null) {
  return (
    FUND_REGIME_OPTIONS.find((option) => option.value === regime)?.label ??
    'Organization default'
  );
}

export function getValuationsLabel(region?: OperatingRegion | null) {
  switch (region) {
    case 'india':
      return 'Valuations';
    case 'eu':
      return 'Valuations';
    case 'us':
      return '409A Valuations';
    default:
      return 'Valuations';
  }
}

export function getTaxCenterLabel(region?: OperatingRegion | null) {
  switch (region) {
    case 'india':
    case 'eu':
      return 'Tax & Reporting';
    case 'us':
      return 'Tax Center';
    default:
      return 'Tax & Reporting';
  }
}
