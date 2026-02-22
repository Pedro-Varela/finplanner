import type { Transaction } from "../entities";
import type { TransactionRepository } from "./transaction-usecases";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface MonthlyDataPoint {
  month: string; // "Jan", "Fev", ...
  year: number;
  income: number;
  expenses: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  monthly: MonthlyDataPoint[];
}

// ---------------------------------------------------------------------------
// Use case
// ---------------------------------------------------------------------------

export class GetDashboardSummary {
  constructor(private repository: TransactionRepository) {}

  async execute(): Promise<DashboardData> {
    const transactions = await this.repository.findAll();
    return {
      summary: computeSummary(transactions),
      monthly: computeMonthlyData(transactions),
    };
  }
}

// ---------------------------------------------------------------------------
// Funções puras (testáveis sem repositório)
// ---------------------------------------------------------------------------

export function computeSummary(transactions: Transaction[]): DashboardSummary {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (tx.type === "income") {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount: transactions.length,
  };
}

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function computeMonthlyData(transactions: Transaction[]): MonthlyDataPoint[] {
  const map = new Map<string, MonthlyDataPoint>();

  for (const tx of transactions) {
    const d = new Date(tx.date + "T00:00:00");
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const key = `${year}-${monthIndex}`;

    let point = map.get(key);
    if (!point) {
      point = { month: MONTH_LABELS[monthIndex], year, income: 0, expenses: 0 };
      map.set(key, point);
    }

    if (tx.type === "income") {
      point.income += tx.amount;
    } else {
      point.expenses += tx.amount;
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return MONTH_LABELS.indexOf(a.month) - MONTH_LABELS.indexOf(b.month);
  });
}
