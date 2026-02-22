import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountRepository } from "@/core/usecases";
import type {
  Account,
  AccountId,
  UserId,
  CreateAccountInput,
  UpdateAccountInput,
} from "@/core/entities";
import type { AccountRow } from "./database-types";
import { RepositoryError } from "./errors";

const TABLE = "accounts";

function toEntity(row: AccountRow): Account {
  return {
    id: row.id as AccountId,
    userId: row.user_id as UserId,
    name: row.name,
    type: row.type,
    createdAt: row.created_at,
  };
}

export class SupabaseAccountRepository implements AccountRepository {
  constructor(private client: SupabaseClient) {}

  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.client.auth.getUser();
    if (!user) throw new RepositoryError("Utilizador não autenticado.", "QUERY_FAILED");
    return user.id;
  }

  async findAll(): Promise<Account[]> {
    const { data, error } = await this.client.from(TABLE).select("*").order("name");
    if (error)
      throw new RepositoryError(`Falha ao listar contas: ${error.message}`, "QUERY_FAILED", error);
    return (data as AccountRow[]).map(toEntity);
  }

  async findById(id: AccountId): Promise<Account | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new RepositoryError(`Falha ao buscar conta: ${error.message}`, "QUERY_FAILED", error);
    }
    return toEntity(data as AccountRow);
  }

  async create(input: CreateAccountInput): Promise<Account> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from(TABLE)
      .insert({ name: input.name, type: input.type, user_id: userId })
      .select()
      .single();
    if (error)
      throw new RepositoryError(`Falha ao criar conta: ${error.message}`, "CREATE_FAILED", error);
    return toEntity(data as AccountRow);
  }

  async update(id: AccountId, input: UpdateAccountInput): Promise<Account> {
    const row: Record<string, unknown> = {};
    if (input.name !== undefined) row.name = input.name;
    if (input.type !== undefined) row.type = input.type;
    const { data, error } = await this.client
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error)
      throw new RepositoryError(
        `Falha ao atualizar conta: ${error.message}`,
        "UPDATE_FAILED",
        error
      );
    return toEntity(data as AccountRow);
  }

  async delete(id: AccountId): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error)
      throw new RepositoryError(`Falha ao remover conta: ${error.message}`, "DELETE_FAILED", error);
  }
}
