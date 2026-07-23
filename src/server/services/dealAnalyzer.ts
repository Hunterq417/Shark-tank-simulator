export interface DealAnalysisInput {
  askingValuation: number; // e.g. 15000000
  offeredValuation: number; // e.g. 25000000
  fundingAmount: number; // e.g. 2500000
  equityRequested: number; // e.g. 10 (%)
  arr: number; // e.g. 2200000
  sector: string;
}

export interface DealAnalysisResult {
  valuationMultiple: string;
  impliedMultiple: string;
  dilutionScore: number; // 0 - 100
  synergyScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: 'STRONG_ACCEPT' | 'COUNTER' | 'REJECT';
  keyInsights: string[];
  suggestedCounter: {
    amount: string;
    equity: string;
    valuation: string;
  };
}

export function analyzeDeal(input: DealAnalysisInput): DealAnalysisResult {
  const asking = input.askingValuation || 15000000;
  const offered = input.offeredValuation || 25000000;
  const amount = input.fundingAmount || 2500000;
  const equity = input.equityRequested || 10;
  const arr = input.arr || 2000000;

  // Rule-based metrics
  const valMultiple = arr > 0 ? (offered / arr).toFixed(1) : '10.0';
  const askingMultiple = arr > 0 ? (asking / arr).toFixed(1) : '7.5';
  const dilution = Math.round((amount / offered) * 100);

  // Synergy scoring based on valuation spread
  const spread = ((offered - asking) / asking) * 100;
  let synergyScore = 82;
  if (spread > 30) synergyScore = 95;
  else if (spread < 0) synergyScore = 65;

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (equity > 25) riskLevel = 'HIGH';
  else if (equity > 15 || Number(valMultiple) > 30) riskLevel = 'MEDIUM';

  let recommendation: 'STRONG_ACCEPT' | 'COUNTER' | 'REJECT' = 'STRONG_ACCEPT';
  if (spread < -15) recommendation = 'COUNTER';
  else if (equity > 30) recommendation = 'REJECT';

  const insights: string[] = [
    `Valuation multiple sits at ${valMultiple}x ARR (Sector benchmark average: 12.5x).`,
    `Equity dilution is constrained to ${dilution}% for $${(amount / 1000000).toFixed(1)}M capital injection.`,
    `Post-money valuation reflects a ${spread > 0 ? '+' : ''}${spread.toFixed(1)}% premium over initial asking term.`
  ];

  if (spread > 20) {
    insights.push('High investor conviction detected; competitive bidding dynamic.');
  }

  // Calculate AI Suggested Counter-Offer
  const suggestedValuation = Math.round(offered * 1.05);
  const suggestedEquity = Math.max(5, Math.round(equity * 0.9));

  return {
    valuationMultiple: `${valMultiple}x ARR`,
    impliedMultiple: `${askingMultiple}x ARR`,
    dilutionScore: dilution,
    synergyScore,
    riskLevel,
    recommendation,
    keyInsights: insights,
    suggestedCounter: {
      amount: `$${(amount / 1000000).toFixed(1)}M`,
      equity: `${suggestedEquity}%`,
      valuation: `$${(suggestedValuation / 1000000).toFixed(1)}M`
    }
  };
}
