export type RejectionReasonCategory =
  | 'market'
  | 'team'
  | 'product'
  | 'financials'
  | 'fit'
  | 'timing'
  | 'other';

export interface RejectionReason {
  id: string;
  category: RejectionReasonCategory;
  label: string;
  selected: boolean;
}

export interface DealInfo {
  companyName: string;
  founderName: string;
  sector: string;
  stage: string;
}

export type DecisionWriterTone = 'warm' | 'professional' | 'concise';

export const toneOptions: { value: DecisionWriterTone; label: string; description: string }[] = [
  { value: 'warm', label: 'Warm & Encouraging', description: 'Supportive and friendly' },
  { value: 'professional', label: 'Professional', description: 'Balanced and respectful' },
  { value: 'concise', label: 'Brief & Direct', description: 'Short and to the point' },
];

export const mockDealInfo: DealInfo = {
  companyName: 'Quantum AI',
  founderName: 'Sarah Chen',
  sector: 'AI/ML',
  stage: 'Series A',
};

export const rejectionReasons: RejectionReason[] = [
  { id: '1', category: 'market', label: 'Market size too small', selected: false },
  { id: '2', category: 'market', label: 'Highly competitive landscape', selected: false },
  { id: '3', category: 'market', label: 'Market timing concerns', selected: false },
  { id: '4', category: 'team', label: 'Team lacks domain expertise', selected: false },
  { id: '5', category: 'team', label: 'Team composition gaps', selected: false },
  { id: '6', category: 'product', label: 'Product-market fit unclear', selected: false },
  { id: '7', category: 'product', label: 'Insufficient differentiation', selected: false },
  { id: '8', category: 'product', label: 'Technology risk', selected: false },
  { id: '9', category: 'financials', label: 'Unit economics not compelling', selected: false },
  { id: '10', category: 'financials', label: 'Capital requirements too high', selected: false },
  { id: '11', category: 'financials', label: 'Valuation mismatch', selected: false },
  { id: '12', category: 'fit', label: 'Outside fund thesis', selected: false },
  { id: '13', category: 'fit', label: 'Stage mismatch', selected: false },
  { id: '14', category: 'timing', label: 'Too early for our fund', selected: false },
  { id: '15', category: 'timing', label: 'Portfolio capacity constraints', selected: false },
];

export const generateMockRejectionLetter = (
  deal: DealInfo,
  selectedReasons: RejectionReason[],
  custom: string,
  tone: DecisionWriterTone
): string => {
  const greeting = tone === 'concise' ? `Hi ${deal.founderName},` : `Dear ${deal.founderName},`;

  const opening =
    tone === 'warm'
      ? `Thank you for taking the time to share ${deal.companyName} with us. We truly appreciate your efforts in building what is clearly an ambitious vision in the ${deal.sector} space.`
      : tone === 'professional'
        ? `Thank you for presenting ${deal.companyName}. We appreciate the opportunity to learn about your work in the ${deal.sector} sector.`
        : `Thank you for presenting ${deal.companyName}.`;

  const decision =
    tone === 'concise'
      ? `After careful review, we've decided not to move forward at this time.`
      : `After thorough consideration and discussion with our investment team, we've decided not to proceed with an investment in ${deal.companyName} at this time.`;

  let reasonsText = '';
  if (selectedReasons.length > 0 || custom) {
    if (tone === 'warm') {
      reasonsText = `\n\nWhile we see potential in what you're building, our decision was influenced by several factors:\n\n`;
    } else if (tone === 'professional') {
      reasonsText = `\n\nOur decision was based on the following considerations:\n\n`;
    } else {
      reasonsText = `\n\nKey factors:\n\n`;
    }

    selectedReasons.forEach((reason, idx) => {
      reasonsText += `${idx + 1}. ${reason.label}\n`;
    });

    if (custom) {
      reasonsText += `${selectedReasons.length + 1}. ${custom}\n`;
    }
  }

  const closing =
    tone === 'warm'
      ? `\n\nWe're impressed by what you've accomplished and wish you the very best as you continue to grow ${deal.companyName}. We'd love to stay in touch and would be happy to reconnect as the company evolves.\n\nPlease don't hesitate to reach out if we can be helpful in any other way, whether through introductions or advice.`
      : tone === 'professional'
        ? `\n\nWe appreciate your time and wish you success with ${deal.companyName}. Please feel free to stay in touch as your company progresses.`
        : `\n\nBest of luck with ${deal.companyName}.`;

  const signature = `\n\nBest regards,\n[Your Name]\n[Fund Name]`;

  return `${greeting}\n\n${opening}\n\n${decision}${reasonsText}${closing}${signature}`;
};
