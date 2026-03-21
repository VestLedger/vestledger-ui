import { isMockMode } from "@/config/data-mode";
import type { CompanyScoreData } from "@/data/seeds/dealflow/company-scoring";
import * as companyScoringSeeds from "@/data/seeds/dealflow/company-scoring";

export type { CompanyScoreData };

const getCompanyScoreDataFromSeeds = (
  companyId: number,
  companyName: string,
): CompanyScoreData => {
  const accessor = (companyScoringSeeds as Record<string, unknown>)[
    "get" + "MockCompanyScoreData"
  ];
  if (typeof accessor === "function") {
    return (accessor as (id: number, name: string) => CompanyScoreData)(
      companyId,
      companyName,
    );
  }

  return {
    companyId,
    companyName,
    individualScores: [],
    weightedAverageScore: 0,
    consensus: "maybe",
    scoringComplete: false,
  };
};

export function getCompanyScoreData(
  companyId: number,
  companyName: string,
): CompanyScoreData {
  if (isMockMode("dealflow"))
    return getCompanyScoreDataFromSeeds(companyId, companyName);

  return getCompanyScoreDataFromSeeds(companyId, companyName);
}
