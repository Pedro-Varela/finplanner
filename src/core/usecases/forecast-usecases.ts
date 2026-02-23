import type { TransactionRepository } from "./transaction-usecases";
import type { ForecastData, ForecastScenarioType, MonthlyForecast } from "../entities/forecast";

export interface GetFinancialForecastDependencies {
    transactionRepo: TransactionRepository;
}

export class GetFinancialForecast {
    constructor(private deps: GetFinancialForecastDependencies) { }

    async execute(monthsToProject: 6 | 12): Promise<ForecastData> {
        const transactions = await this.deps.transactionRepo.findAll();

        const now = new Date();
        // We want the last 6 full months. 
        // E.g., if now is Oct 15, we want April 1 to Sept 30.
        // Or simpler: just the last 6 months of data, maybe including current month if it has data. 
        // Let's use the last 6 months starting from `now` and going back.

        // We group by "YYYY-MM" to find out how many active months we have histories for
        const monthlyTotals = new Map<string, { income: number; expense: number }>();

        // Default current balance can be calculated if we assume sum of all transactions = balance.
        // But for a realistic MVP, let's just sum *all* transactions to get the current accumulated balance.
        let currentBalance = 0;

        for (const tx of transactions) {
            currentBalance += tx.type === "income" ? tx.amount : -tx.amount;

            const d = new Date(tx.date + "T00:00:00");
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

            const current = monthlyTotals.get(key) || { income: 0, expense: 0 };
            if (tx.type === "income") {
                current.income += tx.amount;
            } else {
                current.expense += tx.amount;
            }
            monthlyTotals.set(key, current);
        }

        // Filter to last 6 months (excluding the very current month if we want full months, but for MVP let's just take the last 6 available months sorted desc)
        const sortedMonths = Array.from(monthlyTotals.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 6);

        let sumIncome = 0;
        let sumExpense = 0;

        for (const [_, data] of sortedMonths) {
            sumIncome += data.income;
            sumExpense += data.expense;
        }

        const divisor = sortedMonths.length > 0 ? sortedMonths.length : 1;
        const avgIncome = sumIncome / divisor;
        const avgExpense = sumExpense / divisor;

        // --- Generate Scenarios ---

        const scenarios: Record<ForecastScenarioType, MonthlyForecast[]> = {
            pessimistic: [],
            realistic: [],
            optimistic: [],
        };

        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        for (const scenario of ["realistic", "optimistic", "pessimistic"] as ForecastScenarioType[]) {
            let activeBalance = currentBalance;

            for (let i = 0; i < monthsToProject; i++) {
                const projDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + i, 1);
                const monthYear = `${projDate.getFullYear()}-${String(projDate.getMonth() + 1).padStart(2, "0")}`;

                let expectedIncome = avgIncome;
                let expectedExpense = avgExpense;

                if (scenario === "optimistic") {
                    expectedIncome *= 1.05; // +5% prev income
                    expectedExpense *= 0.95; // -5% prev expense
                } else if (scenario === "pessimistic") {
                    expectedIncome *= 0.95; // -5% prev income
                    expectedExpense *= 1.10; // +10% prev expense
                }

                activeBalance += (expectedIncome - expectedExpense);

                scenarios[scenario].push({
                    monthYear,
                    scenario,
                    expectedIncome,
                    expectedExpense,
                    accumulatedBalance: activeBalance,
                });
            }
        }

        return {
            baselineAverageIncome: avgIncome,
            baselineAverageExpense: avgExpense,
            scenarios,
        };
    }
}
