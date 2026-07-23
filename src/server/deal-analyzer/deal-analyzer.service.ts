import { Injectable } from '@nestjs/common';
import { DealAnalysisInput, DealAnalysisResult } from './deal-analyzer.types';

@Injectable()
export class DealAnalyzerService {
  analyze(input: DealAnalysisInput): DealAnalysisResult {
    const asking = input.askingValuation || 15000000;
    const offered = input.offeredValuation || 25000000;
    const amount = input.fundingAmount || 2500000;
    const equity = input.equityRequested || 10;
    const arr = input.arr || 2000000;

    const valMultiple = arr > 0 ? (offered / arr).toFixed(1) : '10.0';
    const askingMultiple = arr > 0 ? (asking / arr).toFixed(1) : '7.5';
    const dilution = Math.round((amount / offered) * 100);

    const spread = ((offered - asking) / asking) * 100;
    let synergyScore = 82;
    if (spread > 30) synergyScore = 95;
    else if (spread < 0) synergyScore = 65;

    let riskLevel: DealAnalysisResult['riskLevel'] = 'LOW';
    if (equity > 25) riskLevel = 'HIGH';
    else if (equity > 15 || Number(valMultiple) > 30) riskLevel = 'MEDIUM';

    let recommendation: DealAnalysisResult['recommendation'] = 'STRONG_ACCEPT';
    if (spread < -15) recommendation = 'COUNTER';
    else if (equity > 30) recommendation = 'REJECT';

    const insights: string[] = [
      `Valuation multiple sits at ${valMultiple}x ARR (Sector benchmark average: 12.5x).`,
      `Equity dilution is constrained to ${dilution}% for $${(amount / 1000000).toFixed(1)}M capital injection.`,
      `Post-money valuation reflects a ${spread > 0 ? '+' : ''}${spread.toFixed(1)}% premium over initial asking term.`,
    ];

    if (spread > 20) {
      insights.push('High investor conviction detected; competitive bidding dynamic.');
    }

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
        valuation: `$${(suggestedValuation / 1000000).toFixed(1)}M`,
      },
    };
  }
}
