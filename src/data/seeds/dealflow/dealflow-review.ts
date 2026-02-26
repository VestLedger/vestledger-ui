export interface Deal {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  askAmount: number;
  valuation: number;
  arr: number;
  growth: number;
  founderName: string;
  location: string;
  oneLiner: string;
}

export const mockDeals: Deal[] = [
  {
    id: "1",
    companyName: "Quantum AI",
    sector: "AI/ML",
    stage: "Series A",
    askAmount: 15000000,
    valuation: 75000000,
    arr: 2500000,
    growth: 300,
    founderName: "Sarah Chen",
    location: "San Francisco, CA",
    oneLiner: "Enterprise quantum computing platform accessible via API",
  },
  {
    id: "2",
    companyName: "NeuroLink",
    sector: "HealthTech",
    stage: "Seed",
    askAmount: 3000000,
    valuation: 12000000,
    arr: 500000,
    growth: 450,
    founderName: "Michael Rodriguez",
    location: "Boston, MA",
    oneLiner: "AI-powered neural diagnostics for early disease detection",
  },
  {
    id: "3",
    companyName: "GreenCharge",
    sector: "CleanTech",
    stage: "Series B",
    askAmount: 25000000,
    valuation: 150000000,
    arr: 8000000,
    growth: 180,
    founderName: "Emma Thompson",
    location: "Austin, TX",
    oneLiner:
      "Ultra-fast EV charging network with renewable energy integration",
  },
  {
    id: "4",
    companyName: "DataVault",
    sector: "Cybersecurity",
    stage: "Series A",
    askAmount: 12000000,
    valuation: 60000000,
    arr: 3200000,
    growth: 250,
    founderName: "James Park",
    location: "Seattle, WA",
    oneLiner:
      "Zero-trust data security platform for enterprise cloud infrastructure",
  },
  {
    id: "5",
    companyName: "FoodFlow",
    sector: "FoodTech",
    stage: "Seed",
    askAmount: 4500000,
    valuation: 18000000,
    arr: 750000,
    growth: 380,
    founderName: "Maria Garcia",
    location: "Los Angeles, CA",
    oneLiner: "AI-powered supply chain optimization for restaurant groups",
  },
];

