import type {
  Budget,
  BudgetId,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetProgress,
  CategoryId,
} from "../entities";
import type { TransactionRepository } from "./transaction-usecases";
import type { CategoryRepository } from "./category-usecases";
import { ValidationError } from "../errors";

export interface BudgetRepository {
  findByMonthYear(month: number, year: number): Promise<Budget[]>;
  create(data: CreateBudgetInput): Promise<Budget>;
  update(id: BudgetId, data: UpdateBudgetInput): Promise<Budget>;
  delete(id: BudgetId): Promise<void>;
}

export class SetBudget {
  constructor(private repository: BudgetRepository) {}

  async execute(data: CreateBudgetInput): Promise<Budget> {
    if (data.amount <= 0) {
      throw new ValidationError("O valor do orçamento deve ser positivo.", "amount");
    }
    return this.repository.create(data);
  }
}

export class DeleteBudget {
  constructor(private repository: BudgetRepository) {}

  async execute(id: BudgetId): Promise<void> {
    return this.repository.delete(id);
  }
}

export class GetBudgetProgress {
  constructor(
    private budgetRepo: BudgetRepository,
    private transactionRepo: TransactionRepository,
    private categoryRepo: CategoryRepository
  ) {}

  async execute(month: number, year: number): Promise<BudgetProgress[]> {
    const [budgets, categories, transactions] = await Promise.all([
      this.budgetRepo.findByMonthYear(month, year),
      this.categoryRepo.findAll(),
      this.transactionRepo.findAll(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const monthTxs = transactions.filter((tx) => {
      const d = new Date(tx.date + "T00:00:00");
      return d.getMonth() + 1 === month && d.getFullYear() === year && tx.type === "expense";
    });

    const spentByCategory = new Map<string, number>();
    for (const tx of monthTxs) {
      spentByCategory.set(tx.categoryId, (spentByCategory.get(tx.categoryId) ?? 0) + tx.amount);
    }

    return budgets.map((budget) => {
      const cat = categoryMap.get(budget.categoryId as unknown as CategoryId);
      const spent = spentByCategory.get(budget.categoryId) ?? 0;
      return {
        budget,
        categoryName: cat?.name ?? "Sem categoria",
        spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      };
    });
  }
}
