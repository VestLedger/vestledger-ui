import type { Deal } from '@/services/dealflow/dealflowReviewService';
import type { DealflowReviewSlide } from '@/services/dealflow/dealflowReviewService';

// Sector-specific market data
const sectorMarketData: Record<string, { tam: string; sam: string; som: string; growth: string }> = {
  'AI/ML': { tam: '$150B', sam: '$45B', som: '$8B', growth: '35% CAGR' },
  'HealthTech': { tam: '$95B', sam: '$28B', som: '$4.5B', growth: '28% CAGR' },
  'CleanTech': { tam: '$200B', sam: '$60B', som: '$12B', growth: '32% CAGR' },
  'Cybersecurity': { tam: '$180B', sam: '$55B', som: '$9B', growth: '24% CAGR' },
  'FoodTech': { tam: '$75B', sam: '$22B', som: '$3.5B', growth: '22% CAGR' },
  'FinTech': { tam: '$250B', sam: '$75B', som: '$15B', growth: '30% CAGR' },
  'SaaS': { tam: '$300B', sam: '$90B', som: '$18B', growth: '26% CAGR' },
};

const sectorCompetitors: Record<string, string[]> = {
  'AI/ML': ['OpenAI', 'Anthropic', 'Google DeepMind'],
  'HealthTech': ['Teladoc', 'Livongo', 'Amwell'],
  'CleanTech': ['Tesla Energy', 'ChargePoint', 'EVgo'],
  'Cybersecurity': ['CrowdStrike', 'Palo Alto Networks', 'Zscaler'],
  'FoodTech': ['DoorDash', 'Instacart', 'Uber Eats'],
  'FinTech': ['Stripe', 'Plaid', 'Square'],
  'SaaS': ['Salesforce', 'HubSpot', 'Zendesk'],
};

const sectorProductDescriptions: Record<string, { description: string; differentiators: string[]; techStack: string[] }> = {
  'AI/ML': {
    description: 'Next-generation AI platform with proprietary algorithms',
    differentiators: ['Real-time processing', 'Enterprise-grade security', 'Easy API integration'],
    techStack: ['Deep Learning', 'Cloud-native architecture', 'RESTful APIs'],
  },
  'HealthTech': {
    description: 'AI-powered diagnostics and patient care platform',
    differentiators: ['FDA-cleared algorithms', 'EMR integration', 'HIPAA compliant'],
    techStack: ['Neural networks', 'FHIR standards', 'Secure cloud infrastructure'],
  },
  'CleanTech': {
    description: 'Sustainable energy infrastructure with smart grid integration',
    differentiators: ['Ultra-fast charging', 'Renewable energy sourcing', 'Grid optimization'],
    techStack: ['IoT sensors', 'Smart grid protocols', 'Energy management systems'],
  },
  'Cybersecurity': {
    description: 'Zero-trust security platform for modern enterprises',
    differentiators: ['AI threat detection', 'Zero-trust architecture', 'Real-time monitoring'],
    techStack: ['ML anomaly detection', 'Encryption protocols', 'SIEM integration'],
  },
  'FoodTech': {
    description: 'AI-powered supply chain and operations platform',
    differentiators: ['Demand forecasting', 'Waste reduction', 'Multi-location support'],
    techStack: ['Predictive analytics', 'Real-time inventory', 'POS integrations'],
  },
  'FinTech': {
    description: 'Modern financial infrastructure for digital-first businesses',
    differentiators: ['Instant settlements', 'Global coverage', 'Developer-first API'],
    techStack: ['Distributed ledger', 'Real-time payments', 'Bank-grade security'],
  },
  'SaaS': {
    description: 'Enterprise software platform with seamless integrations',
    differentiators: ['No-code customization', 'Enterprise SSO', 'White-label options'],
    techStack: ['Microservices', 'Multi-tenant architecture', 'GraphQL APIs'],
  },
};

// Generate team data based on company
function getTeamForCompany(companyName: string, _founderName: string) {
  const teamTemplates = [
    { role: 'CTO', backgrounds: ['MIT PhD, ex-Google', 'Stanford PhD, ex-Meta', 'Carnegie Mellon MS, ex-Amazon'] },
    { role: 'VP Sales', backgrounds: ['ex-Salesforce, 12yr enterprise', 'ex-Oracle, 15yr B2B', 'ex-SAP, 10yr SaaS'] },
    { role: 'VP Engineering', backgrounds: ['ex-Netflix, scaled 10x', 'ex-Uber, built core systems', 'ex-Stripe, payments expert'] },
  ];

  // Use company name hash to generate consistent but varied team
  const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return teamTemplates.map((template, idx) => ({
    name: `Team Member ${idx + 1}`,
    role: template.role,
    background: template.backgrounds[hash % template.backgrounds.length],
  }));
}

export function getMockDealflowReviewSlides(deal: Deal): DealflowReviewSlide[] {
  const marketData = sectorMarketData[deal.sector] || { tam: '$50B', sam: '$15B', som: '$2B', growth: '25% CAGR' };
  const competitors = sectorCompetitors[deal.sector] || ['Competitor A', 'Competitor B', 'Competitor C'];
  const productData = sectorProductDescriptions[deal.sector] || {
    description: 'Innovative platform solution',
    differentiators: ['API-first approach', 'Enterprise security', 'Easy integration'],
    techStack: ['Cloud infrastructure', 'Modern APIs', 'Scalable architecture'],
  };
  const team = getTeamForCompany(deal.companyName, deal.founderName);
  
  // Calculate financials based on deal data
  const burn = Math.round(deal.arr / 6); // Assume ~6 months ARR as burn
  const runway = Math.round((deal.askAmount * 0.8) / burn); // 80% of ask for runway
  const ltv = Math.round(deal.arr / 4 * 3); // 3 years average
  const cac = Math.round(ltv / 5); // 5x LTV:CAC ratio target
  const grossMargin = 70 + (deal.growth / 100); // Base 70% + growth bonus

  return [
    {
      id: '1',
      type: 'overview',
      title: 'Company Overview',
      content: {
        companyName: deal.companyName,
        oneLiner: deal.oneLiner,
        founder: deal.founderName,
        location: deal.location,
        sector: deal.sector,
        stage: deal.stage,
      },
    },
    {
      id: '2',
      type: 'market',
      title: 'Market Opportunity',
      content: {
        tam: marketData.tam,
        sam: marketData.sam,
        som: marketData.som,
        growth: marketData.growth,
        competitors: competitors,
      },
    },
    {
      id: '3',
      type: 'product',
      title: 'Product & Technology',
      content: {
        description: productData.description,
        differentiators: productData.differentiators,
        techStack: productData.techStack,
      },
    },
    {
      id: '4',
      type: 'financials',
      title: 'Financial Metrics',
      content: {
        arr: deal.arr,
        growth: deal.growth,
        burn: burn,
        runway: runway,
        ltv: ltv,
        cac: cac,
        grossMargin: Math.min(grossMargin, 85),
      },
    },
    {
      id: '5',
      type: 'team',
      title: 'Team',
      content: {
        founder: deal.founderName,
        team: [
          { name: deal.founderName, role: 'CEO & Founder', background: `${deal.sector} industry veteran` },
          ...team,
        ],
        advisors: [`Prof. ${deal.sector} Expert (Stanford)`, `Dr. Industry Leader (MIT)`],
      },
    },
    {
      id: '6',
      type: 'ask',
      title: 'Investment Ask',
      content: {
        amount: deal.askAmount,
        valuation: deal.valuation,
        useOfFunds: [
          { category: 'Product Development', percentage: 40 },
          { category: 'Sales & Marketing', percentage: 35 },
          { category: 'Operations', percentage: 15 },
          { category: 'Hiring', percentage: 10 },
        ],
      },
    },
  ];
}
