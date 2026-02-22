import type { TransactionId, CategoryId, UserId } from "./id";

// ---------------------------------------------------------------------------
// Value types
// ---------------------------------------------------------------------------

export type TransactionType = "income" | "expense";

// ---------------------------------------------------------------------------
// Entity — modelo de domínio completo
// ---------------------------------------------------------------------------

export interface Transaction {
  id: TransactionId;
  userId: UserId;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: CategoryId;
  date: string; // ISO 8601 (YYYY-MM-DD)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// DTOs — contratos de entrada, sem campos gerados pelo sistema
// ---------------------------------------------------------------------------

export interface CreateTransactionInput {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: CategoryId;
  date: string;
}

export interface UpdateTransactionInput {
  description?: string;
  amount?: number;
  type?: TransactionType;
  categoryId?: CategoryId;
  date?: string;
}
