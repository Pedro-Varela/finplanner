import type { Transaction, Category } from "../entities";
import type { TransactionRepository } from "./transaction-usecases";
import type { CategoryRepository } from "./category-usecases";

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
  month: string;
  year: number;
  income: number;
  expenses: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  type: "income" | "expense";
  total: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  previousMonthSummary: DashboardSummary;
  monthly: MonthlyDataPoint[];
  byCategory: CategoryBreakdown[];
  recentTransactions: Transaction[];
}

// ---------------------------------------------------------------------------
// Use case
// ---------------------------------------------------------------------------

export class GetDashboardSummary {
  constructor(
    private transactionRepo: TransactionRepository,
    private categoryRepo: CategoryRepository
  ) {}

  async execute(): Promise<DashboardData> {
    const [transactions, categories] = await Promise.all([
      this.transactionRepo.findAll(),
      this.categoryRepo.findAll(),
    ]);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTxs = transactions.filter((tx) => {
      const d = new Date(tx.date + "T00:00:00");
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthTxs = transactions.filter((tx) => {
      const d = new Date(tx.date + "T00:00:00");
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return {
      summary: computeSummary(currentMonthTxs),
      previousMonthSummary: computeSummary(prevMonthTxs),
      monthly: computeMonthlyData(transactions),
      byCategory: computeCategoryBreakdown(currentMonthTxs, categoryMap),
      recentTransactions: transactions.slice(0, 5),
    };
  }
}

// ---------------------------------------------------------------------------
// Funções puras
// ---------------------------------------------------------------------------

export function computeSummary(transactions: Transaction[]): DashboardSummary {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (tx.type === "income") totalIncome += tx.amount;
    else totalExpenses += tx.amount;
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

    if (tx.type === "income") point.income += tx.amount;
    else point.expenses += tx.amount;
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return MONTH_LABELS.indexOf(a.month) - MONTH_LABELS.indexOf(b.month);
  });
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  categoryMap: Map<string, Category>
): CategoryBreakdown[] {
  const map = new Map<string, CategoryBreakdown>();

  for (const tx of transactions) {
    let entry = map.get(tx.categoryId);
    if (!entry) {
      const cat = categoryMap.get(tx.categoryId);
      entry = {
        categoryId: tx.categoryId,
        categoryName: cat?.name ?? "Sem categoria",
        type: tx.type,
        total: 0,
      };
      map.set(tx.categoryId, entry);
    }
    entry.total += tx.amount;
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}
