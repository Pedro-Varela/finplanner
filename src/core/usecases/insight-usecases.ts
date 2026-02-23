import { InsightId, Insight, CreateInsightInput } from "../entities/insight";
import type { Transaction } from "../entities/transaction";
import type { Category } from "../entities/category";
import type { RecurringTransaction } from "../entities/recurring-transaction";
import type { TransactionRepository } from "./transaction-usecases";
import type { CategoryRepository } from "./category-usecases";
import type { RecurringTransactionRepository } from "./recurring-usecases";

export interface InsightRepository {
  findAllActive(): Promise<Insight[]>;
  findAllHistory(): Promise<Insight[]>;
  create(input: CreateInsightInput): Promise<Insight>;
  markAsResolved(id: InsightId): Promise<Insight>;
}

export interface GenerateInsightsDependencies {
  insightRepo: InsightRepository;
  transactionRepo: TransactionRepository;
  categoryRepo: CategoryRepository;
  recurringRepo: RecurringTransactionRepository;
}

export class GenerateInsights {
  constructor(private deps: GenerateInsightsDependencies) { }

  async execute(): Promise<void> {
    // 1. Fetch data
    const activeInsights = await this.deps.insightRepo.findAllActive();
    const existingTitles = new Set(activeInsights.map((i) => i.title));

    const [transactions, categories, recurring] = await Promise.all([
      this.deps.transactionRepo.findAll(),
      this.deps.categoryRepo.findAll(),
      this.deps.recurringRepo.findAll(),
    ]);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expenses = transactions.filter((tx: Transaction) => tx.type === "expense");

    // --- Rule 1: Gastos Subindo ---
    const getYM = (dateStr: string) => {
      const d = new Date(dateStr + "T00:00:00");
      return { y: d.getFullYear(), m: d.getMonth() };
    };

    const currentMonthExpenses = expenses.filter((tx: Transaction) => {
      const { y, m } = getYM(tx.date);
      return y === currentYear && m === currentMonth;
    });

    const last3MonthsExpenses = expenses.filter((tx: Transaction) => {
      const { y, m } = getYM(tx.date);
      const dateScore = y * 12 + m;
      const currentScore = currentYear * 12 + currentMonth;
      const diff = currentScore - dateScore;
      return diff >= 1 && diff <= 3;
    });

    const catMap = new Map<string, string>(categories.map((c: Category) => [c.id, c.name]));
    const catCurrent = new Map<string, number>();
    for (const tx of currentMonthExpenses) {
      catCurrent.set(tx.categoryId, (catCurrent.get(tx.categoryId) || 0) + tx.amount);
    }

    const catHistory = new Map<string, number>();
    for (const tx of last3MonthsExpenses) {
      catHistory.set(tx.categoryId, (catHistory.get(tx.categoryId) || 0) + tx.amount);
    }

    const newInsights: CreateInsightInput[] = [];

    for (const [catId, currentAmount] of Array.from(catCurrent.entries())) {
      const histAmount = catHistory.get(catId) || 0;
      const avg3Months = histAmount / 3;

      // If current amount is > 20% compared to average AND > 50 EUR
      if (avg3Months > 0 && currentAmount > avg3Months * 1.2 && currentAmount > 50) {
        const catName = catMap.get(catId) || "Categoria Desconhecida";
        const title = `Gastos altos em ${catName}`;
        if (!existingTitles.has(title)) {
          newInsights.push({
            title,
            description: `Você já gastou R$${currentAmount.toFixed(2)} em ${catName} este mês, o que é mais de 20% acima da sua média de R$${avg3Months.toFixed(2)}.`,
            type: "warning",
          });
        }
      }
    }

    // --- Rule 2: Gasto Recorrente Não Registrado ---
    const activeRecurring = recurring.filter((r: RecurringTransaction) => r.active);
    for (const r of activeRecurring) {
      const expectedDate = new Date(r.nextDate + "T00:00:00");
      // Se a data esperada já passou este mês ou hoje
      if (expectedDate <= now && expectedDate.getMonth() === currentMonth) {
        // Checar se já tem alguma transação pra essa categoria perto do valor
        const found = currentMonthExpenses.some(
          (tx: Transaction) =>
            tx.categoryId === r.categoryId && tx.title.toLowerCase().includes(r.title.toLowerCase())
        );

        if (!found) {
          const title = `Transação recorrente pendente: ${r.title}`;
          if (!existingTitles.has(title)) {
            newInsights.push({
              title,
              description: `A despesa '${r.title}' (prevista para ${r.nextDate}) ainda não foi registrada neste mês.`,
              type: "info",
            });
          }
        }
      }
    }

    // Save all
    for (const insight of newInsights) {
      await this.deps.insightRepo.create(insight);
    }
  }
}
