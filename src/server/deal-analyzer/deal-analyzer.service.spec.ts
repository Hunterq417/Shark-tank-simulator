import { DealAnalyzerService } from './deal-analyzer.service';

describe('DealAnalyzerService', () => {
  let service: DealAnalyzerService;

  beforeEach(() => {
    service = new DealAnalyzerService();
  });

  it('recommends STRONG_ACCEPT when the offered valuation is well above asking', () => {
    const result = service.analyze({
      askingValuation: 15_000_000,
      offeredValuation: 25_000_000,
      fundingAmount: 2_500_000,
      equityRequested: 10,
      arr: 2_200_000,
      sector: 'AI & Data',
    });

    expect(result.recommendation).toBe('STRONG_ACCEPT');
    expect(result.riskLevel).toBe('LOW');
    expect(result.valuationMultiple).toContain('x ARR');
    expect(result.keyInsights.length).toBeGreaterThan(0);
  });

  it('recommends COUNTER when the offer undercuts the asking valuation by more than 15%', () => {
    const result = service.analyze({
      askingValuation: 20_000_000,
      offeredValuation: 15_000_000,
      fundingAmount: 2_000_000,
      equityRequested: 10,
      arr: 1_500_000,
      sector: 'FinTech',
    });

    expect(result.recommendation).toBe('COUNTER');
  });

  it('recommends REJECT and flags HIGH risk when equity requested exceeds 30%', () => {
    const result = service.analyze({
      askingValuation: 10_000_000,
      offeredValuation: 12_000_000,
      fundingAmount: 4_000_000,
      equityRequested: 35,
      arr: 1_000_000,
      sector: 'B2B SaaS',
    });

    expect(result.recommendation).toBe('REJECT');
    expect(result.riskLevel).toBe('HIGH');
  });

  it('falls back to sane defaults when inputs are zero/undefined', () => {
    const result = service.analyze({
      askingValuation: 0,
      offeredValuation: 0,
      fundingAmount: 0,
      equityRequested: 0,
      arr: 0,
      sector: '',
    });

    expect(result.valuationMultiple).toBe('12.5x ARR');
    expect(result.impliedMultiple).toBe('7.5x ARR');
  });

  it('computes a suggested counter offer above the current offer', () => {
    const result = service.analyze({
      askingValuation: 15_000_000,
      offeredValuation: 25_000_000,
      fundingAmount: 2_500_000,
      equityRequested: 10,
      arr: 2_200_000,
      sector: 'AI & Data',
    });

    const suggestedValuation = Number(result.suggestedCounter.valuation.replace(/[^0-9.]/g, ''));
    expect(suggestedValuation).toBeGreaterThan(25);
  });
});
