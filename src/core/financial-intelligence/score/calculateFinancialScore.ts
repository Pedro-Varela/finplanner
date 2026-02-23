import type { FinancialScore, FinancialSnapshot } from "../types";

const WEIGHTS = {
  savings: 0.35,
  commitment: 0.25,
  forecast: 0.25,
  stability: 0.15,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeSavingsScore(savingsRate: number): number {
  if (savingsRate >= 25) return 100;
  if (savingsRate <= -20) return 0;
  return clamp(((savingsRate + 20) / 45) * 100, 0, 100);
}

function normalizeCommitmentScore(recurringCommitmentRate: number): number {
  if (recurringCommitmentRate <= 15) return 100;
  if (recurringCommitmentRate >= 70) return 0;
  return clamp(100 - ((recurringCommitmentRate - 15) / 55) * 100, 0, 100);
}

function normalizeForecastScore(projectedEndOfMonthBalance: number, totalIncome: number): number {
  if (projectedEndOfMonthBalance >= totalIncome * 0.2) return 100;
  if (projectedEndOfMonthBalance <= -totalIncome * 0.2) return 0;

  const denominator = totalIncome * 0.4 || 1;
  return clamp(((projectedEndOfMonthBalance + totalIncome * 0.2) / denominator) * 100, 0, 100);
}

function normalizeStabilityScore(expenseConcentrationRate: number): number {
  if (expenseConcentrationRate <= 20) return 100;
  if (expenseConcentrationRate >= 70) return 0;
  return clamp(100 - ((expenseConcentrationRate - 20) / 50) * 100, 0, 100);
}

export function calculateFinancialScore(snapshot: FinancialSnapshot): FinancialScore {
  const savingsScore = normalizeSavingsScore(snapshot.savingsRate);
  const commitmentScore = normalizeCommitmentScore(snapshot.recurringCommitmentRate);
  const forecastScore = normalizeForecastScore(
    snapshot.projectedEndOfMonthBalance,
    snapshot.totalIncome
  );
  const stabilityScore = normalizeStabilityScore(snapshot.expenseConcentrationRate);

  const overallScore = clamp(
    savingsScore * WEIGHTS.savings +
      commitmentScore * WEIGHTS.commitment +
      forecastScore * WEIGHTS.forecast +
      stabilityScore * WEIGHTS.stability,
    0,
    100
  );

  return {
    overallScore: Math.round(overallScore),
    breakdown: {
      savingsScore: Math.round(savingsScore),
      commitmentScore: Math.round(commitmentScore),
      forecastScore: Math.round(forecastScore),
      stabilityScore: Math.round(stabilityScore),
    },
  };
}
