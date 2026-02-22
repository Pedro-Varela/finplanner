import type { CategoryId, UserId } from "./id";

type Brand<T, B extends string> = T & { readonly __brand: B };
export type BudgetId = Brand<string, "BudgetId">;

export interface Budget {
  id: BudgetId;
  categoryId: CategoryId;
  userId: UserId;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
}

export interface CreateBudgetInput {
  categoryId: CategoryId;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetInput {
  amount?: number;
}

export interface BudgetProgress {
  budget: Budget;
  categoryName: string;
  spent: number;
  percentage: number;
}
