import type {
  Category,
  RecurringFrequency,
  RecurringTransaction,
  Transaction,
} from "@/core/entities";
import type {
  FinancialSnapshot,
  FinancialTopCategory,
  GenerateFinancialSnapshotOptions,
} from "../types";

const ESSENTIAL_KEYWORDS = [
  "aluguel",
  "renda",
  "moradia",
  "condominio",
  "água",
  "agua",
  "luz",
  "energia",
  "internet",
  "telefone",
  "mercado",
  "supermercado",
  "farmacia",
  "farmácia",
  "saude",
  "saúde",
  "transporte",
  "combustivel",
  "combustível",
  "gasolina",
  "seguro",
  "escola",
  "educacao",
  "educação",
  "imposto",
];

const INVESTMENT_KEYWORDS = [
  "invest",
  "reserva",
  "aposentadoria",
  "previdencia",
  "previdência",
  "tesouro",
  "cdb",
  "fii",
  "acoes",
  "ações",
  "cript",
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function monthToRef(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseDateStart(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function resolveReferenceMonth(
  transactions: Transaction[],
  recurring: RecurringTransaction[],
  referenceMonth?: string
): string {
  const MONTH_REF_RE = /^\d{4}-\d{2}$/;
  if (referenceMonth && MONTH_REF_RE.test(referenceMonth)) {
    return referenceMonth;
  }

  const transactionDates = transactions.map((tx) => tx.date);
  if (transactionDates.length > 0) {
    const latestTransactionDate = transactionDates.reduce((max, date) => (date > max ? date : max));
    return latestTransactionDate.slice(0, 7);
  }

  const recurringDates = recurring.filter((item) => item.active).map((item) => item.nextDate);
  if (recurringDates.length > 0) {
    const latestRecurringDate = recurringDates.reduce((max, date) => (date > max ? date : max));
    return latestRecurringDate.slice(0, 7);
  }

  return monthToRef(new Date());
}

function validateMonthRef(monthRef: string): string {
  const MONTH_REF_RE = /^\d{4}-\d{2}$/;
  return MONTH_REF_RE.test(monthRef) ? monthRef : monthToRef(new Date());
}

function recurringToMonthlyAmount(amount: number, frequency: RecurringFrequency): number {
  if (frequency === "weekly") return amount * (52 / 12);
  if (frequency === "yearly") return amount / 12;
  return amount;
}

function detectBucket(categoryName: string): "essential" | "leisure" | "investment" {
  const name = normalize(categoryName);

  if (INVESTMENT_KEYWORDS.some((keyword) => name.includes(keyword))) {
    return "investment";
  }

  if (ESSENTIAL_KEYWORDS.some((keyword) => name.includes(keyword))) {
    return "essential";
  }

  return "leisure";
}

function buildTopCategories(
  expenseTransactions: Transaction[],
  categories: Category[]
): FinancialTopCategory[] {
  const categoryById = new Map(categories.map((category) => [String(category.id), category.name]));
  const totals = new Map<string, number>();

  for (const transaction of expenseTransactions) {
    const key = String(transaction.categoryId);
    totals.set(key, (totals.get(key) ?? 0) + transaction.amount);
  }

  const totalExpense = Array.from(totals.values()).reduce((acc, value) => acc + value, 0);
  if (totalExpense <= 0) return [];

  return Array.from(totals.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      categoryName: categoryById.get(categoryId) ?? "Categoria desconhecida",
      amount,
      percentage: clamp((amount / totalExpense) * 100, 0, 100),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

export function generateFinancialSnapshot(
  transactions: Transaction[],
  categories: Category[],
  recurring: RecurringTransaction[],
  options?: GenerateFinancialSnapshotOptions
): FinancialSnapshot {
  const monthRef = validateMonthRef(
    resolveReferenceMonth(transactions, recurring, options?.referenceMonth)
  );
  const monthTransactions = transactions.filter((transaction) =>
    transaction.date.startsWith(monthRef)
  );
  const monthDate = parseDateStart(`${monthRef}-01`);
  const daysInMonth = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)
  ).getUTCDate();

  const incomeTransactions = monthTransactions.filter(
    (transaction) => transaction.type === "income"
  );
  const expenseTransactions = monthTransactions.filter(
    (transaction) => transaction.type === "expense"
  );

  const totalIncome = incomeTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalExpense = expenseTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );

  const categoryById = new Map(categories.map((category) => [String(category.id), category]));

  let essentialExpense = 0;
  let leisureExpense = 0;
  let investmentAmount = 0;

  for (const transaction of expenseTransactions) {
    const category = categoryById.get(String(transaction.categoryId));
    const categoryName = category?.name ?? "Categoria desconhecida";
    const bucket = detectBucket(categoryName);

    if (bucket === "essential") essentialExpense += transaction.amount;
    if (bucket === "leisure") leisureExpense += transaction.amount;
    if (bucket === "investment") investmentAmount += transaction.amount;
  }

  const savingsRate =
    totalIncome > 0 ? clamp(((totalIncome - totalExpense) / totalIncome) * 100, -100, 100) : 0;

  const monthDaysWithTransactions = monthTransactions.map((transaction) =>
    Number(transaction.date.slice(8, 10))
  );
  const currentDay =
    monthDaysWithTransactions.length > 0 ? Math.max(...monthDaysWithTransactions) : 1;
  const elapsedDays = clamp(currentDay, 1, daysInMonth);

  const dailyIncomeRate = totalIncome / elapsedDays;
  const dailyExpenseRate = totalExpense / elapsedDays;
  const projectedEndOfMonthBalance =
    dailyIncomeRate * daysInMonth -
    dailyExpenseRate * daysInMonth -
    recurring
      .filter((item) => item.active && item.nextDate.startsWith(monthRef) && item.amount > 0)
      .reduce((acc, item) => acc + recurringToMonthlyAmount(item.amount, item.frequency), 0);

  const topCategories = buildTopCategories(expenseTransactions, categories);
  const topCategoryAmount = topCategories[0]?.amount ?? 0;
  const expenseConcentrationRate =
    totalExpense > 0 ? clamp((topCategoryAmount / totalExpense) * 100, 0, 100) : 0;

  const previousMonthDate = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() - 1, 1)
  );
  const previousMonthRef = monthToRef(previousMonthDate);
  const previousMonthExpense = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.date.startsWith(previousMonthRef)
    )
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const monthlyExpenseTrendRate =
    previousMonthExpense > 0
      ? clamp(((totalExpense - previousMonthExpense) / previousMonthExpense) * 100, -100, 500)
      : 0;

  const recurringMonthlyCommitment = recurring
    .filter((item) => item.active)
    .reduce((acc, item) => acc + recurringToMonthlyAmount(item.amount, item.frequency), 0);

  const recurringCommitmentRate =
    totalIncome > 0 ? clamp((recurringMonthlyCommitment / totalIncome) * 100, 0, 500) : 0;

  return {
    monthRef,
    totalIncome,
    totalExpense,
    savingsRate,
    essentialExpense,
    leisureExpense,
    investmentAmount,
    projectedEndOfMonthBalance,
    topCategories,
    recurringCommitmentRate,
    expenseConcentrationRate,
    monthlyExpenseTrendRate,
  };
}
