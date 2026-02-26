export interface IndividualScore {
  partnerId: string;
  partnerName: string;
  partnerInitials: string;
  scores: { [criteriaId: string]: number }; // 1-10 scale
  overallScore: number;
  comments?: string;
  submittedAt: string;
}

export interface CompanyScoreData {
  companyId: number;
  companyName: string;
  individualScores: IndividualScore[];
  weightedAverageScore: number;
  consensus: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no';
  scoringComplete: boolean;
}

const mockScoreDataByCompanyId: Record<number, CompanyScoreData> = {
  1: {
    companyId: 1,
    companyName: 'Quantum AI',
    individualScores: [
      {
        partnerId: 'p1',
        partnerName: 'Sarah Johnson',
        partnerInitials: 'SJ',
        scores: { team: 9, market: 8, product: 9, traction: 8, financials: 8 },
        overallScore: 8.45,
        comments:
          'Exceptional founding team with deep quantum expertise. Strong product-market fit demonstrated by growth.',
        submittedAt: '2024-11-28T10:30:00',
      },
      {
        partnerId: 'p2',
        partnerName: 'Michael Chen',
        partnerInitials: 'MC',
        scores: { team: 8, market: 7, product: 8, traction: 7, financials: 7 },
        overallScore: 7.5,
        comments: 'Good team but concerned about competitive landscape. Market timing is uncertain.',
        submittedAt: '2024-11-28T14:15:00',
      },
      {
        partnerId: 'p3',
        partnerName: 'Emily Zhang',
        partnerInitials: 'EZ',
        scores: { team: 9, market: 8, product: 8, traction: 9, financials: 8 },
        overallScore: 8.4,
        comments: 'Impressive traction with Fortune 500 pilots. Unit economics look solid.',
        submittedAt: '2024-11-28T16:45:00',
      },
    ],
    weightedAverageScore: 8.12,
    consensus: 'yes',
    scoringComplete: true,
  },
  2: {
    companyId: 2,
    companyName: 'NeuroLink',
    individualScores: [
      {
        partnerId: 'p1',
        partnerName: 'Sarah Johnson',
        partnerInitials: 'SJ',
        scores: { team: 8, market: 8, product: 9, traction: 6, financials: 6 },
        overallScore: 7.55,
        comments: 'Strong product promise; still early on traction and reimbursement clarity.',
        submittedAt: '2024-11-29T09:20:00',
      },
      {
        partnerId: 'p2',
        partnerName: 'Michael Chen',
        partnerInitials: 'MC',
        scores: { team: 7, market: 8, product: 8, traction: 6, financials: 6 },
        overallScore: 7.05,
        comments: 'Market tailwinds, but regulatory path needs more evidence.',
        submittedAt: '2024-11-29T11:05:00',
      },
    ],
    weightedAverageScore: 7.3,
    consensus: 'maybe',
    scoringComplete: false,
  },
  3: {
    companyId: 3,
    companyName: 'GreenCharge',
    individualScores: [
      {
        partnerId: 'p1',
        partnerName: 'Sarah Johnson',
        partnerInitials: 'SJ',
        scores: { team: 8, market: 9, product: 8, traction: 8, financials: 7 },
        overallScore: 8.0,
        comments: 'Large TAM and proven deployment velocity. Unit economics need more data.',
        submittedAt: '2024-11-30T10:10:00',
      },
      {
        partnerId: 'p3',
        partnerName: 'Emily Zhang',
        partnerInitials: 'EZ',
        scores: { team: 8, market: 9, product: 8, traction: 9, financials: 7 },
        overallScore: 8.25,
        comments: 'Strong traction with strategic partners. Competitive but differentiated.',
        submittedAt: '2024-11-30T13:40:00',
      },
    ],
    weightedAverageScore: 8.12,
    consensus: 'yes',
    scoringComplete: true,
  },
  4: {
    companyId: 4,
    companyName: 'DataVault',
    individualScores: [
      {
        partnerId: 'p2',
        partnerName: 'Michael Chen',
        partnerInitials: 'MC',
        scores: { team: 8, market: 8, product: 7, traction: 7, financials: 7 },
        overallScore: 7.45,
        comments: 'Crowded market, but mid-market focus could win. Needs clearer differentiation.',
        submittedAt: '2024-12-01T15:20:00',
      },
      {
        partnerId: 'p3',
        partnerName: 'Emily Zhang',
        partnerInitials: 'EZ',
        scores: { team: 8, market: 8, product: 8, traction: 7, financials: 7 },
        overallScore: 7.65,
        comments: 'Solid team and execution cadence. Want more proof on expansion.',
        submittedAt: '2024-12-01T16:10:00',
      },
    ],
    weightedAverageScore: 7.55,
    consensus: 'maybe',
    scoringComplete: false,
  },
  5: {
    companyId: 5,
    companyName: 'FoodFlow',
    individualScores: [
      {
        partnerId: 'p1',
        partnerName: 'Sarah Johnson',
        partnerInitials: 'SJ',
        scores: { team: 7, market: 7, product: 7, traction: 8, financials: 7 },
        overallScore: 7.2,
        comments: 'Promising traction with restaurant groups. Needs deeper margin story.',
        submittedAt: '2024-12-02T09:45:00',
      },
      {
        partnerId: 'p2',
        partnerName: 'Michael Chen',
        partnerInitials: 'MC',
        scores: { team: 7, market: 7, product: 6, traction: 7, financials: 6 },
        overallScore: 6.7,
        comments: 'Customer pain is real but product differentiation is modest.',
        submittedAt: '2024-12-02T12:05:00',
      },
    ],
    weightedAverageScore: 6.95,
    consensus: 'maybe',
    scoringComplete: false,
  },
};

export function getMockCompanyScoreData(companyId: number, companyName: string): CompanyScoreData {
  const fallback = mockScoreDataByCompanyId[1];
  const data = mockScoreDataByCompanyId[companyId];
  if (data) return data;
  return {
    ...fallback,
    companyId,
    companyName,
  };
}
