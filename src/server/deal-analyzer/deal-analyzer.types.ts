export interface DealAnalysisInput {
  askingValuation: number;
  offeredValuation: number;
  fundingAmount: number;
  equityRequested: number;
  arr: number;
  sector: string;
}

export interface DealAnalysisResult {
  valuationMultiple: string;
  impliedMultiple: string;
  dilutionScore: number;
  synergyScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: 'STRONG_ACCEPT' | 'COUNTER' | 'REJECT';
  keyInsights: string[];
  suggestedCounter: {
    amount: string;
    equity: string;
    valuation: string;
  };
}
