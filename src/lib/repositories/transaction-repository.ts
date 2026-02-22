import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransactionRepository } from "@/core/usecases";
import type {
  Transaction,
  TransactionId,
  CategoryId,
  UserId,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/core/entities";
import type { TransactionRow } from "./database-types";
import { RepositoryError } from "./errors";

const TABLE = "transactions";

function toEntity(row: TransactionRow): Transaction {
  return {
    id: row.id as TransactionId,
    userId: row.user_id as UserId,
    title: row.title,
    amount: row.amount,
    type: row.type,
    categoryId: row.category_id as CategoryId,
    date: row.date,
    createdAt: row.created_at,
  };
}

export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private client: SupabaseClient) {}

  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.client.auth.getUser();
    if (!user) throw new RepositoryError("Utilizador não autenticado.", "QUERY_FAILED");
    return user.id;
  }

  async findAll(): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      throw new RepositoryError(
        `Falha ao listar transações: ${error.message}`,
        "QUERY_FAILED",
        error
      );
    }
    return (data as TransactionRow[]).map(toEntity);
  }

  async findById(id: TransactionId): Promise<Transaction | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new RepositoryError(
        `Falha ao buscar transação ${id}: ${error.message}`,
        "QUERY_FAILED",
        error
      );
    }
    return toEntity(data as TransactionRow);
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        title: input.title,
        amount: input.amount,
        type: input.type,
        category_id: input.categoryId,
        date: input.date,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new RepositoryError(
        `Falha ao criar transação: ${error.message}`,
        "CREATE_FAILED",
        error
      );
    }
    return toEntity(data as TransactionRow);
  }

  async update(id: TransactionId, input: UpdateTransactionInput): Promise<Transaction> {
    const row: Record<string, unknown> = {};
    if (input.title !== undefined) row.title = input.title;
    if (input.amount !== undefined) row.amount = input.amount;
    if (input.type !== undefined) row.type = input.type;
    if (input.categoryId !== undefined) row.category_id = input.categoryId;
    if (input.date !== undefined) row.date = input.date;

    const { data, error } = await this.client
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new RepositoryError(`Transação ${id} não encontrada.`, "NOT_FOUND", error);
      }
      throw new RepositoryError(
        `Falha ao atualizar transação ${id}: ${error.message}`,
        "UPDATE_FAILED",
        error
      );
    }
    return toEntity(data as TransactionRow);
  }

  async delete(id: TransactionId): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) {
      throw new RepositoryError(
        `Falha ao remover transação ${id}: ${error.message}`,
        "DELETE_FAILED",
        error
      );
    }
  }
}
