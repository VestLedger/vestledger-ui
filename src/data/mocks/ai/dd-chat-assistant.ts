export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedQuestions?: string[];
  relatedDocs?: { name: string; category: string }[];
  insights?: { type: 'positive' | 'negative' | 'neutral'; text: string }[];
}

const MOCK_NOW = new Date('2025-01-01T12:00:00.000Z');

function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function responseId(query: string, dealName?: string): string {
  return `resp_${hashString(`${dealName ?? ''}|${query.toLowerCase()}`)}`;
}

export const mockConversations: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hi! I'm your AI Due Diligence Assistant. I can help you analyze deals, answer questions about companies in your pipeline, and provide insights from uploaded documents. What would you like to know?",
    timestamp: new Date(MOCK_NOW.getTime()),
    suggestedQuestions: [
      'What are the key risks for Quantum AI?',
      'Compare unit economics across my active deals',
      "What's the competitive landscape for NeuroLink?",
      'Summarize financial metrics for CloudScale',
    ],
  },
];

export const getMockDDChatResponse = (query: string, dealName?: string): Message => {
  const lowerQuery = query.toLowerCase();

  // Mock intelligent responses based on query patterns
  if (lowerQuery.includes('risk') || lowerQuery.includes('red flag')) {
    return {
      id: responseId(query, dealName),
      role: 'assistant',
      content: `Based on my analysis of ${dealName || 'the selected deal'}, here are the key risks identified:\n\n1. **Market Risk**: Competing against well-funded tech giants (IBM Quantum, Google Quantum AI)\n2. **Technology Risk**: Quantum computing market is still early and unproven\n3. **Moat Concern**: Limited defensibility beyond technical expertise\n\nHowever, these are partially offset by:\n- Strong technical team with quantum expertise from top institutions\n- Clear product-market fit (15% MoM growth)\n- Enterprise traction with Fortune 500 pilots`,
      timestamp: new Date(MOCK_NOW.getTime()),
      insights: [
        { type: 'negative', text: 'Competitive pressure from tech giants' },
        { type: 'negative', text: 'Early-stage market with adoption uncertainty' },
        { type: 'positive', text: 'Strong founding team mitigates execution risk' },
      ],
      relatedDocs: [
        { name: 'Quantum_AI_Deck_Nov2024.pdf', category: 'Pitch Deck' },
        { name: 'Competitive Analysis', category: 'Market Research' },
        { name: 'Reference Call Notes', category: 'Team Assessment' },
      ],
      suggestedQuestions: [
        'How does the team plan to compete with IBM and Google?',
        "What's the timeline to market adoption for quantum computing?",
        'Are there any defensive moats being built?',
      ],
    };
  }

  if (lowerQuery.includes('unit economics') || lowerQuery.includes('ltv') || lowerQuery.includes('cac')) {
    return {
      id: responseId(query, dealName),
      role: 'assistant',
      content: `Here's a comparison of unit economics across your active deals:\n\n**Quantum AI**\n- CAC: $850\n- LTV: $4,200\n- LTV:CAC Ratio: 4.9x ✓\n- Payback Period: 8 months\n\n**NeuroLink**\n- CAC: $1,200\n- LTV: $3,800\n- LTV:CAC Ratio: 3.2x ⚠\n- Payback Period: 11 months\n\n**CloudScale**\n- CAC: $650\n- LTV: $5,800\n- LTV:CAC Ratio: 8.9x ✓✓\n- Payback Period: 6 months\n\n**Analysis**: CloudScale shows the strongest unit economics with excellent LTV:CAC ratio and quick payback. Quantum AI is solid. NeuroLink's 3.2x ratio is acceptable but below the ideal 3:1 threshold for early-stage companies.`,
      timestamp: new Date(MOCK_NOW.getTime()),
      insights: [
        { type: 'positive', text: 'CloudScale has exceptional unit economics (8.9x)' },
        { type: 'neutral', text: 'Quantum AI shows healthy 4.9x ratio' },
        { type: 'negative', text: 'NeuroLink ratio of 3.2x is below optimal for medical devices' },
      ],
      suggestedQuestions: [
        "What's driving CloudScale's superior unit economics?",
        "How can NeuroLink improve their LTV:CAC ratio?",
        'What are the gross margins for each deal?',
      ],
    };
  }

  if (lowerQuery.includes('competitive') || lowerQuery.includes('competition')) {
    return {
      id: responseId(query, dealName),
      role: 'assistant',
      content: `For ${dealName || 'this deal'}, here's the competitive landscape analysis:\n\n**Direct Competitors**:\n- IBM Quantum (Market Leader, $billions in funding)\n- Google Quantum AI (Tech giant resources)\n- IonQ (Public company, $650M market cap)\n\n**Competitive Positioning**:\n✓ **Differentiation**: Hybrid quantum-classical approach makes quantum accessible via APIs\n✓ **Target Market**: Focusing on enterprise SaaS vs hardware sales\n✓ **Go-to-Market**: Bottom-up developer adoption vs top-down enterprise sales\n\n**Market Dynamics**:\n- Total addressable market: $50B by 2030\n- Currently fragmented with no dominant player in enterprise software layer\n- Window of opportunity for 2-3 years before consolidation\n\n**Recommendation**: Strong differentiation in GTM strategy, but monitor competitive moves closely.`,
      timestamp: new Date(MOCK_NOW.getTime()),
      relatedDocs: [
        { name: 'Competitive Analysis Report', category: 'Market Research' },
        { name: 'Industry Landscape 2024', category: 'Market Research' },
      ],
      suggestedQuestions: [
        "What's the competitive moat strategy?",
        'How quickly can competitors replicate this approach?',
        'What partnerships could strengthen market position?',
      ],
    };
  }

  // Default response
  return {
    id: responseId(query, dealName),
    role: 'assistant',
    content: `I can help you with that! Based on the documents and data available for ${dealName || 'your deals'}, I'd be happy to provide insights.\n\nTo give you the most relevant analysis, could you be more specific about what aspect you'd like to explore?\n\nSome areas I can help with:\n- Financial metrics and projections\n- Market sizing and competitive analysis\n- Team assessment and founder background\n- Risk analysis and red flags\n- Comparative analysis across deals`,
    timestamp: new Date(MOCK_NOW.getTime()),
    suggestedQuestions: [
      'What are the key financial metrics?',
      'How does this compare to similar deals?',
      'What are the main risks?',
      'Tell me about the founding team',
    ],
  };
};
