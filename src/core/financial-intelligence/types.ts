import type { Category, RecurringTransaction, Transaction } from "@/core/entities";

export interface FinancialTopCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
}

export interface FinancialSnapshot {
  monthRef: string;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
  essentialExpense: number;
  leisureExpense: number;
  investmentAmount: number;
  projectedEndOfMonthBalance: number;
  topCategories: FinancialTopCategory[];
  recurringCommitmentRate: number;
  expenseConcentrationRate: number;
  monthlyExpenseTrendRate: number;
}

export interface FinancialScoreBreakdown {
  savingsScore: number;
  commitmentScore: number;
  forecastScore: number;
  stabilityScore: number;
}

export interface FinancialScore {
  overallScore: number;
  breakdown: FinancialScoreBreakdown;
}

export type EnvelopeStatusFlag = "ok" | "warning" | "over";

export interface EnvelopeConfig {
  essentialsPct: number;
  leisurePct: number;
  investmentsPct: number;
}

export interface EnvelopeBucketStatus {
  targetPct: number;
  actualPct: number;
  amount: number;
  differencePct: number;
  status: EnvelopeStatusFlag;
}

export interface EnvelopeStatus {
  status: EnvelopeStatusFlag;
  essentials: EnvelopeBucketStatus;
  leisure: EnvelopeBucketStatus;
  investments: EnvelopeBucketStatus;
}

export type StrategicInsightType =
  | "high_cost_structure"
  | "negative_balance_risk"
  | "low_savings"
  | "category_dependency"
  | "growing_expense_trend";

export type StrategicInsightSeverity = "low" | "medium" | "high" | "critical";

export interface StrategicInsight {
  id: string;
  type: StrategicInsightType;
  severity: StrategicInsightSeverity;
  title: string;
  description: string;
}

export interface GenerateFinancialSnapshotInput {
  transactions: Transaction[];
  categories: Category[];
  recurring: RecurringTransaction[];
}

export interface GenerateFinancialSnapshotOptions {
  referenceMonth?: string;
}
