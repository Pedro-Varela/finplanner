import type { CategoryId, UserId } from "./id";
import type { AccountId } from "./account";

type Brand<T, B extends string> = T & { readonly __brand: B };
export type RecurringTransactionId = Brand<string, "RecurringTransactionId">;

export type RecurringFrequency = "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: RecurringTransactionId;
  userId: UserId;
  title: string;
  amount: number;
  categoryId: CategoryId;
  accountId?: AccountId;
  frequency: RecurringFrequency;
  nextDate: string;
  active: boolean;
  createdAt: string;
}

export interface CreateRecurringInput {
  title: string;
  amount: number;
  categoryId: CategoryId;
  accountId?: AccountId;
  frequency: RecurringFrequency;
  nextDate: string;
}

export interface UpdateRecurringInput {
  title?: string;
  amount?: number;
  categoryId?: CategoryId;
  frequency?: RecurringFrequency;
  nextDate?: string;
  active?: boolean;
}
