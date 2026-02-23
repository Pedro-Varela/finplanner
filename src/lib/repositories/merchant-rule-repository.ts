import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MerchantRule,
  MerchantRuleId,
  CategoryId,
  UserId,
  CreateMerchantRuleInput,
} from "@/core/entities";
import type { MerchantRuleRow } from "./database-types";
import { RepositoryError } from "./errors";

const TABLE = "merchant_rules";

function toEntity(row: MerchantRuleRow): MerchantRule {
  return {
    id: row.id as MerchantRuleId,
    userId: row.user_id as UserId,
    pattern: row.pattern,
    matchType: row.match_type,
    categoryId: row.category_id ? (row.category_id as CategoryId) : null,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

export interface MerchantRuleRepository {
  findAllForUser(): Promise<MerchantRule[]>;
  create(data: CreateMerchantRuleInput): Promise<MerchantRule>;
  delete(id: MerchantRuleId): Promise<void>;
}

export class SupabaseMerchantRuleRepository implements MerchantRuleRepository {
  constructor(private client: SupabaseClient) {}

  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.client.auth.getUser();
    if (!user) throw new RepositoryError("Utilizador não autenticado.", "QUERY_FAILED");
    return user.id;
  }

  async findAllForUser(): Promise<MerchantRule[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .order("priority", { ascending: true });

    if (error) {
      throw new RepositoryError(`Falha ao listar regras: ${error.message}`, "QUERY_FAILED", error);
    }
    return (data as MerchantRuleRow[]).map(toEntity);
  }

  async create(input: CreateMerchantRuleInput): Promise<MerchantRule> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from(TABLE)
      .upsert(
        {
          user_id: userId,
          pattern: input.pattern,
          match_type: input.matchType,
          category_id: input.categoryId,
          priority: input.priority ?? 100,
        },
        { onConflict: "user_id,pattern,match_type" }
      )
      .select()
      .single();

    if (error) {
      throw new RepositoryError(`Falha ao criar regra: ${error.message}`, "CREATE_FAILED", error);
    }
    return toEntity(data as MerchantRuleRow);
  }

  async delete(id: MerchantRuleId): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) {
      throw new RepositoryError(`Falha ao remover regra: ${error.message}`, "DELETE_FAILED", error);
    }
  }
}
