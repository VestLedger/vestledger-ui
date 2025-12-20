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

export const mockScoreData: CompanyScoreData = {
  companyId: 1,
  companyName: 'Quantum AI',
  individualScores: [
    {
      partnerId: 'p1',
      partnerName: 'Sarah Johnson',
      partnerInitials: 'SJ',
      scores: {
        team: 9,
        market: 8,
        product: 9,
        traction: 8,
        financials: 8,
      },
      overallScore: 8.45,
      comments:
        'Exceptional founding team with deep quantum expertise. Strong product-market fit demonstrated by growth.',
      submittedAt: '2024-11-28T10:30:00',
    },
    {
      partnerId: 'p2',
      partnerName: 'Michael Chen',
      partnerInitials: 'MC',
      scores: {
        team: 8,
        market: 7,
        product: 8,
        traction: 7,
        financials: 7,
      },
      overallScore: 7.50,
      comments: 'Good team but concerned about competitive landscape. Market timing is uncertain.',
      submittedAt: '2024-11-28T14:15:00',
    },
    {
      partnerId: 'p3',
      partnerName: 'Emily Zhang',
      partnerInitials: 'EZ',
      scores: {
        team: 9,
        market: 8,
        product: 8,
        traction: 9,
        financials: 8,
      },
      overallScore: 8.40,
      comments: 'Impressive traction with Fortune 500 pilots. Unit economics look solid.',
      submittedAt: '2024-11-28T16:45:00',
    },
  ],
  weightedAverageScore: 8.12,
  consensus: 'yes',
  scoringComplete: true,
};

