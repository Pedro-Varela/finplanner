export type ForecastScenarioType = "pessimistic" | "realistic" | "optimistic";

export interface MonthlyForecast {
  monthYear: string; // e.g. "2024-03"
  scenario: ForecastScenarioType;
  expectedIncome: number;
  expectedExpense: number;
  accumulatedBalance: number;
}

export interface ForecastData {
  baselineAverageIncome: number;
  baselineAverageExpense: number;
  scenarios: Record<ForecastScenarioType, MonthlyForecast[]>;
}
