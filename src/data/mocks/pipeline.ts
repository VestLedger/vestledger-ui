import type { Suggestion } from "@/data/mocks/ai/copilot";

export type PipelineDealOutcome =
  | "active"
  | "won"
  | "lost"
  | "withdrawn"
  | "passed";

export interface PipelineDeal {
  id: number | string;
  name: string;
  stage: string;
  outcome: PipelineDealOutcome;
  sector: string;
  amount: string;
  probability: number;
  founder: string;
  lastContact: string;
}

export const pipelineStages = [
  "sourced",
  "first_meeting",
  "due_diligence",
  "term_sheet",
  "closed",
];

export const pipelineDeals: PipelineDeal[] = [
  {
    id: 1,
    name: "Quantum AI",
    stage: "due_diligence",
    outcome: "active",
    sector: "AI/ML",
    amount: "$2.5M",
    probability: 75,
    founder: "Sarah Chen",
    lastContact: "2 days ago",
  },
  {
    id: 2,
    name: "BioTech Labs",
    stage: "term_sheet",
    outcome: "active",
    sector: "Healthcare",
    amount: "$1.8M",
    probability: 85,
    founder: "Dr. James Wilson",
    lastContact: "1 day ago",
  },
  {
    id: 3,
    name: "CloudScale",
    stage: "due_diligence",
    outcome: "active",
    sector: "SaaS",
    amount: "$3.2M",
    probability: 70,
    founder: "Maria Rodriguez",
    lastContact: "3 days ago",
  },
  {
    id: 4,
    name: "FinFlow",
    stage: "first_meeting",
    outcome: "active",
    sector: "FinTech",
    amount: "$2.0M",
    probability: 45,
    founder: "Alex Kumar",
    lastContact: "1 week ago",
  },
  {
    id: 5,
    name: "DataStream",
    stage: "sourced",
    outcome: "active",
    sector: "Analytics",
    amount: "$1.5M",
    probability: 30,
    founder: "Emma Thompson",
    lastContact: "2 weeks ago",
  },
  {
    id: 6,
    name: "EcoEnergy",
    stage: "first_meeting",
    outcome: "active",
    sector: "CleanTech",
    amount: "$4.0M",
    probability: 50,
    founder: "John Park",
    lastContact: "5 days ago",
  },
  {
    id: 7,
    name: "NeuroLink",
    stage: "due_diligence",
    outcome: "active",
    sector: "MedTech",
    amount: "$2.8M",
    probability: 80,
    founder: "Lisa Zhang",
    lastContact: "1 day ago",
  },
  {
    id: 8,
    name: "SpaceLogix",
    stage: "sourced",
    outcome: "active",
    sector: "Aerospace",
    amount: "$5.0M",
    probability: 25,
    founder: "Mike Anderson",
    lastContact: "3 weeks ago",
  },
  // Closed deals
  {
    id: 9,
    name: "TechVision",
    stage: "closed",
    outcome: "won",
    sector: "AI/ML",
    amount: "$3.5M",
    probability: 100,
    founder: "Rachel Kim",
    lastContact: "1 month ago",
  },
  {
    id: 10,
    name: "HealthPlus",
    stage: "closed",
    outcome: "lost",
    sector: "Healthcare",
    amount: "$2.2M",
    probability: 0,
    founder: "Tom Chen",
    lastContact: "2 months ago",
  },
  {
    id: 11,
    name: "GreenTech",
    stage: "closed",
    outcome: "withdrawn",
    sector: "CleanTech",
    amount: "$1.8M",
    probability: 0,
    founder: "Sam Park",
    lastContact: "3 months ago",
  },
];

export const pipelineCopilotSuggestions: Suggestion[] = [
  {
    id: "pipeline-inbound",
    text: "Publish the startup application form",
    reasoning:
      "Auto-enrich the pipeline with AI-scored inbound deals and prioritize high-match submissions.",
    confidence: 0.82,
  },
];
