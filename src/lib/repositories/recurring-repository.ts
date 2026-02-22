import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecurringTransactionRepository } from "@/core/usecases";
import type {
  RecurringTransaction,
  RecurringTransactionId,
  CategoryId,
  UserId,
  CreateRecurringInput,
  UpdateRecurringInput,
} from "@/core/entities";
import type { AccountId } from "@/core/entities";
import type { RecurringTransactionRow } from "./database-types";
import { RepositoryError } from "./errors";

const TABLE = "recurring_transactions";

function toEntity(row: RecurringTransactionRow): RecurringTransaction {
  return {
    id: row.id as RecurringTransactionId,
    userId: row.user_id as UserId,
    title: row.title,
    amount: row.amount,
    categoryId: row.category_id as CategoryId,
    accountId: row.account_id ? (row.account_id as AccountId) : undefined,
    frequency: row.frequency,
    nextDate: row.next_date,
    active: row.active,
    createdAt: row.created_at,
  };
}

export class SupabaseRecurringRepository implements RecurringTransactionRepository {
  constructor(private client: SupabaseClient) {}

  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.client.auth.getUser();
    if (!user) throw new RepositoryError("Utilizador não autenticado.", "QUERY_FAILED");
    return user.id;
  }

  async findAll(): Promise<RecurringTransaction[]> {
    const { data, error } = await this.client.from(TABLE).select("*").order("next_date");
    if (error)
      throw new RepositoryError(
        `Falha ao listar recorrências: ${error.message}`,
        "QUERY_FAILED",
        error
      );
    return (data as RecurringTransactionRow[]).map(toEntity);
  }

  async create(input: CreateRecurringInput): Promise<RecurringTransaction> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        user_id: userId,
        title: input.title,
        amount: input.amount,
        category_id: input.categoryId,
        account_id: input.accountId ?? null,
        frequency: input.frequency,
        next_date: input.nextDate,
        active: true,
      })
      .select()
      .single();
    if (error)
      throw new RepositoryError(
        `Falha ao criar recorrência: ${error.message}`,
        "CREATE_FAILED",
        error
      );
    return toEntity(data as RecurringTransactionRow);
  }

  async update(
    id: RecurringTransactionId,
    input: UpdateRecurringInput
  ): Promise<RecurringTransaction> {
    const row: Record<string, unknown> = {};
    if (input.title !== undefined) row.title = input.title;
    if (input.amount !== undefined) row.amount = input.amount;
    if (input.categoryId !== undefined) row.category_id = input.categoryId;
    if (input.frequency !== undefined) row.frequency = input.frequency;
    if (input.nextDate !== undefined) row.next_date = input.nextDate;
    if (input.active !== undefined) row.active = input.active;

    const { data, error } = await this.client
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error)
      throw new RepositoryError(
        `Falha ao atualizar recorrência: ${error.message}`,
        "UPDATE_FAILED",
        error
      );
    return toEntity(data as RecurringTransactionRow);
  }

  async delete(id: RecurringTransactionId): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error)
      throw new RepositoryError(
        `Falha ao remover recorrência: ${error.message}`,
        "DELETE_FAILED",
        error
      );
  }
}
