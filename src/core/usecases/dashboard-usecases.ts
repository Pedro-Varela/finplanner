import type { Transaction, Category } from "../entities";
import { resolveCategoryFamily, type CategoryFamily } from "../categories/category-taxonomy";
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
  categoryIcon: string;
  categoryFamily: CategoryFamily;
  type: "income" | "expense";
  total: number;
}

export interface CategoryHeatmapPoint {
  day: number;
  amount: number;
}

export interface CategoryHeatmapSeries {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryFamily: CategoryFamily;
  total: number;
  peakDay: number | null;
  peakAmount: number;
  daily: CategoryHeatmapPoint[];
}

export interface DashboardData {
  currentMonthRef: string;
  daysInCurrentMonth: number;
  summary: DashboardSummary;
  previousMonthSummary: DashboardSummary;
  monthly: MonthlyDataPoint[];
  byCategory: CategoryBreakdown[];
  categoryHeatmap: CategoryHeatmapSeries[];
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
    const currentMonthRef = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthTxs = transactions.filter((tx) => {
      const d = new Date(tx.date + "T00:00:00");
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return {
      currentMonthRef,
      daysInCurrentMonth,
      summary: computeSummary(currentMonthTxs),
      previousMonthSummary: computeSummary(prevMonthTxs),
      monthly: computeMonthlyData(transactions),
      byCategory: computeCategoryBreakdown(currentMonthTxs, categoryMap),
      categoryHeatmap: computeCategoryHeatmap(currentMonthTxs, categoryMap, daysInCurrentMonth),
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
        categoryIcon: cat?.icon ?? "tag",
        categoryFamily: resolveCategoryFamily({
          name: cat?.name ?? "Sem categoria",
          icon: cat?.icon,
        }),
        type: tx.type,
        total: 0,
      };
      map.set(tx.categoryId, entry);
    }
    entry.total += tx.amount;
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export function computeCategoryHeatmap(
  transactions: Transaction[],
  categoryMap: Map<string, Category>,
  daysInMonth: number
): CategoryHeatmapSeries[] {
  const map = new Map<string, CategoryHeatmapSeries>();

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;

    const day = Number(tx.date.slice(8, 10));
    if (!Number.isFinite(day) || day < 1 || day > daysInMonth) continue;

    let entry = map.get(tx.categoryId);
    if (!entry) {
      const cat = categoryMap.get(tx.categoryId);
      entry = {
        categoryId: tx.categoryId,
        categoryName: cat?.name ?? "Sem categoria",
        categoryIcon: cat?.icon ?? "tag",
        categoryFamily: resolveCategoryFamily({
          name: cat?.name ?? "Sem categoria",
          icon: cat?.icon,
        }),
        total: 0,
        peakDay: null,
        peakAmount: 0,
        daily: Array.from({ length: daysInMonth }, (_, idx) => ({ day: idx + 1, amount: 0 })),
      };
      map.set(tx.categoryId, entry);
    }

    entry.total += tx.amount;
    const point = entry.daily[day - 1];
    point.amount += tx.amount;
    if (point.amount > entry.peakAmount) {
      entry.peakAmount = point.amount;
      entry.peakDay = day;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}
