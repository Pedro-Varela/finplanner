import type { SupabaseClient } from "@supabase/supabase-js";
import type { BudgetRepository } from "@/core/usecases";
import type {
  Budget,
  BudgetId,
  CategoryId,
  UserId,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@/core/entities";
import type { BudgetRow } from "./database-types";
import { RepositoryError } from "./errors";

const TABLE = "budgets";

function toEntity(row: BudgetRow): Budget {
  return {
    id: row.id as BudgetId,
    categoryId: row.category_id as CategoryId,
    userId: row.user_id as UserId,
    amount: row.amount,
    month: row.month,
    year: row.year,
    createdAt: row.created_at,
  };
}

export class SupabaseBudgetRepository implements BudgetRepository {
  constructor(private client: SupabaseClient) {}

  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.client.auth.getUser();
    if (!user) throw new RepositoryError("Utilizador não autenticado.", "QUERY_FAILED");
    return user.id;
  }

  async findByMonthYear(month: number, year: number): Promise<Budget[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("month", month)
      .eq("year", year);

    if (error) {
      throw new RepositoryError(
        `Falha ao listar orçamentos: ${error.message}`,
        "QUERY_FAILED",
        error
      );
    }
    return (data as BudgetRow[]).map(toEntity);
  }

  async create(input: CreateBudgetInput): Promise<Budget> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from(TABLE)
      .upsert(
        {
          category_id: input.categoryId,
          user_id: userId,
          amount: input.amount,
          month: input.month,
          year: input.year,
        },
        { onConflict: "category_id,month,year" }
      )
      .select()
      .single();

    if (error) {
      throw new RepositoryError(
        `Falha ao criar orçamento: ${error.message}`,
        "CREATE_FAILED",
        error
      );
    }
    return toEntity(data as BudgetRow);
  }

  async update(id: BudgetId, input: UpdateBudgetInput): Promise<Budget> {
    const row: Record<string, unknown> = {};
    if (input.amount !== undefined) row.amount = input.amount;

    const { data, error } = await this.client
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new RepositoryError(
        `Falha ao atualizar orçamento: ${error.message}`,
        "UPDATE_FAILED",
        error
      );
    }
    return toEntity(data as BudgetRow);
  }

  async delete(id: BudgetId): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) {
      throw new RepositoryError(
        `Falha ao remover orçamento: ${error.message}`,
        "DELETE_FAILED",
        error
      );
    }
  }
}
