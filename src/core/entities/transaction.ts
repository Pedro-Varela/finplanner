import type { TransactionId, CategoryId, UserId } from "./id";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: TransactionId;
  userId: UserId;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: CategoryId;
  date: string;
  createdAt: string;
  normalizedMerchant?: string | null;
}

export interface CreateTransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: CategoryId;
  date: string;
  normalizedMerchant?: string | null;
}

export interface UpdateTransactionInput {
  title?: string;
  amount?: number;
  type?: TransactionType;
  categoryId?: CategoryId;
  date?: string;
  normalizedMerchant?: string | null;
}

export interface TransactionFilters {
  search?: string;
  categoryId?: CategoryId;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
}
