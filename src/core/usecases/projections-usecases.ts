import type { Transaction, Category } from "../entities";
import type { TransactionRepository } from "./transaction-usecases";
import type { CategoryRepository } from "./category-usecases";

export interface CategoryTrend {
  categoryId: string;
  categoryName: string;
  currentAmount: number;
  averageAmount: number;
  percentageChange: number;
  trend: "up" | "down" | "stable";
}

export interface ProjectionsData {
  invoiceEstimatedTotal: number;
  invoiceDifferenceFromLastMonth: number;
  trendingCategories: CategoryTrend[];
}

export class GetProjections {
  constructor(
    private transactionRepo: TransactionRepository,
    private categoryRepo: CategoryRepository
  ) {}

  async execute(): Promise<ProjectionsData> {
    const [transactions, categories] = await Promise.all([
      this.transactionRepo.findAll(),
      this.categoryRepo.findAll(),
    ]);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // We consider 3 months prior to CURRENT month (so if current is Aug, we look at May, Jun, Jul)
    // to calculate the average.

    // We filter for expenses since projections usually care about spending.
    const expenses = transactions.filter((tx) => tx.type === "expense");

    // Helper to get year/month from ISO string "YYYY-MM-DD"
    const getYM = (dateStr: string) => {
      const d = new Date(dateStr + "T00:00:00");
      return { y: d.getFullYear(), m: d.getMonth() };
    };

    // Calculate invoice logic (simplistic: all expenses from current month vs previous)
    let currentMonthTotal = 0;
    let prevMonthTotal = 0;

    const currentMonthExpenses = [];
    const last3MonthsExpenses = [];

    for (const tx of expenses) {
      const { y, m } = getYM(tx.date);
      if (y === currentYear && m === currentMonth) {
        currentMonthTotal += tx.amount;
        currentMonthExpenses.push(tx);
      } else if (y === prevYear && m === prevMonth) {
        prevMonthTotal += tx.amount;
        // previous month is part of last 3 months
        last3MonthsExpenses.push(tx);
      } else {
        // check if it fits in the 2 months before prevMonth
        const dateScore = y * 12 + m;
        const currentScore = currentYear * 12 + currentMonth;
        const diff = currentScore - dateScore;
        if (diff > 1 && diff <= 3) {
          // 2 or 3 months ago
          last3MonthsExpenses.push(tx);
        }
      }
    }

    // Invoice Projection (Simple Run-Rate or just raw totals for now)
    // Advanced: (currentMonthTotal / daysPassed) * daysInMonth
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysPassed = now.getDate();
    // avoid division by zero if it's the very first moment of the 1st
    const runRate = daysPassed > 0 ? (currentMonthTotal / daysPassed) * daysInMonth : 0;

    const invoiceEstimatedTotal = runRate;
    const invoiceDifferenceFromLastMonth = invoiceEstimatedTotal - prevMonthTotal;

    // Trend Logic
    const categoryMap = new Map<string, string>(categories.map((c) => [c.id, c.name]));

    const catCurrentMap = new Map<string, number>();
    for (const tx of currentMonthExpenses) {
      const catId = tx.categoryId || "uncategorized";
      catCurrentMap.set(catId, (catCurrentMap.get(catId) || 0) + tx.amount);
    }

    const catHistoryMap = new Map<string, number>();
    for (const tx of last3MonthsExpenses) {
      const catId = tx.categoryId || "uncategorized";
      catHistoryMap.set(catId, (catHistoryMap.get(catId) || 0) + tx.amount);
    }

    const trends: CategoryTrend[] = [];

    // Evaluate categories that have spending this month OR historical spending
    const allCategoriesSet = new Set([
      ...Array.from(catCurrentMap.keys()),
      ...Array.from(catHistoryMap.keys()),
    ]);

    for (const catId of Array.from(allCategoriesSet)) {
      const currentAmount = catCurrentMap.get(catId) || 0;
      // Average over 3 months
      const averageAmount = (catHistoryMap.get(catId) || 0) / 3;

      let percentageChange = 0;
      if (averageAmount > 0) {
        percentageChange = ((currentAmount - averageAmount) / averageAmount) * 100;
      } else if (currentAmount > 0) {
        percentageChange = 100; // Infinity effectively, but capping for UI
      }

      let trend: "up" | "down" | "stable" = "stable";
      if (percentageChange > 5) trend = "up";
      else if (percentageChange < -5) trend = "down";

      // Only interested in significant categories (e.g., > 10 avg or current) to avoid noise
      if (currentAmount > 10 || averageAmount > 10) {
        trends.push({
          categoryId: catId,
          categoryName: categoryMap.get(catId) || "Sem categoria",
          currentAmount,
          averageAmount,
          percentageChange,
          trend,
        });
      }
    }

    // Sort trends: categories growing the most go first
    trends.sort((a, b) => b.percentageChange - a.percentageChange);

    return {
      invoiceEstimatedTotal,
      invoiceDifferenceFromLastMonth,
      trendingCategories: trends,
    };
  }
}
