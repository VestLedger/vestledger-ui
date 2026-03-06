export type OperatingRegion = 'india' | 'eu' | 'us';

export type FundRegulatoryRegime =
  | 'india_sebi_aif'
  | 'eu_aifmd'
  | 'us_private_fund';

export interface FundRegulatoryProfile {
  regulator?: string;
  registrationNumber?: string;
  registrationDate?: string;
  legalStructure?: string;
  domicile?: string;
  reportingNotes?: string;
  india?: {
    category?: string;
    subCategory?: string;
    legalStructure?: string;
    sebiRegistrationNo?: string;
    sebiRegistrationDate?: string;
    schemeName?: string;
    sponsorName?: string;
    investmentManagerName?: string;
    trusteeName?: string;
    custodianName?: string;
    minCorpus?: number;
    minInvestment?: number;
    maxInvestors?: number;
    leveragePermitted?: boolean;
    sponsorCommitmentPct?: number;
  };
  eu?: {
    homeMemberState?: string;
    aifmName?: string;
    depositoryName?: string;
    marketingCountries?: string[];
    annexIvFrequency?: string;
  };
  us?: {
    adviserType?: string;
    exemptionType?: string;
    offeringType?: string;
    filingReferences?: string[];
  };
}
