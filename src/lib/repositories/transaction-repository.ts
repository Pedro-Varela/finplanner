import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransactionRepository } from "@/core/usecases";
import type {
  Transaction,
  TransactionId,
  CategoryId,
  UserId,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  BulkTransactionInput,
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
    normalizedMerchant: row.normalized_merchant,
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

  async findAll(filters?: TransactionFilters): Promise<Transaction[]> {
    let query = this.client.from(TABLE).select("*");

    if (filters?.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }
    if (filters?.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }
    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.dateFrom) {
      query = query.gte("date", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("date", filters.dateTo);
    }

    const { data, error } = await query.order("date", { ascending: false });

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
        normalized_merchant: input.normalizedMerchant,
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
    if (input.normalizedMerchant !== undefined) row.normalized_merchant = input.normalizedMerchant;

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

  async findByImportedHashes(hashes: string[]): Promise<Set<string>> {
    if (hashes.length === 0) return new Set();

    const { data, error } = await this.client
      .from(TABLE)
      .select("imported_hash")
      .in("imported_hash", hashes);

    if (error) {
      throw new RepositoryError(`Falha ao buscar hashes: ${error.message}`, "QUERY_FAILED", error);
    }

    return new Set(
      (data as { imported_hash: string | null }[])
        .map((r) => r.imported_hash)
        .filter((h): h is string => h !== null)
    );
  }

  async bulkInsert(items: BulkTransactionInput[]): Promise<number> {
    if (items.length === 0) return 0;

    const userId = await this.getUserId();

    const rows = items.map((item) => ({
      user_id: userId,
      title: item.title,
      amount: item.amount,
      type: item.type,
      category_id: item.categoryId,
      date: item.date,
      source: item.source,
      imported_hash: item.importedHash,
      normalized_merchant: item.normalizedMerchant,
    }));

    const { data, error } = await this.client.from(TABLE).insert(rows).select("id");

    if (error) {
      throw new RepositoryError(
        `Falha ao importar transações: ${error.message}`,
        "CREATE_FAILED",
        error
      );
    }

    return data?.length ?? 0;
  }
}
