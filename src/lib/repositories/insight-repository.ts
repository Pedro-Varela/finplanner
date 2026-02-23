import type { SupabaseClient } from "@supabase/supabase-js";
import type { InsightRepository } from "@/core/usecases";
import type { UserId } from "@/core/entities";
import type { Insight, InsightId, CreateInsightInput } from "@/core/entities/insight";
import type { InsightRow } from "./database-types";
import { RepositoryError } from "./errors";

const TABLE = "insights";

function toEntity(row: InsightRow): Insight {
  return {
    id: row.id as InsightId,
    userId: row.user_id as UserId,
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

export class SupabaseInsightRepository implements InsightRepository {
  constructor(private client: SupabaseClient) {}

  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.client.auth.getUser();
    if (!user) throw new RepositoryError("Utilizador não autenticado.", "QUERY_FAILED");
    return user.id;
  }

  async findAllActive(): Promise<Insight[]> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      throw new RepositoryError(
        `Falha ao listar insights: ${error.message} `,
        "QUERY_FAILED",
        error
      );
    }
    return (data as InsightRow[]).map(toEntity);
  }

  async findAllHistory(): Promise<Insight[]> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new RepositoryError(
        `Falha ao listar histórico: ${error.message} `,
        "QUERY_FAILED",
        error
      );
    }
    return (data as InsightRow[]).map(toEntity);
  }

  async create(input: CreateInsightInput): Promise<Insight> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        type: input.type,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      throw new RepositoryError(
        `Falha ao criar insight: ${error.message} `,
        "CREATE_FAILED",
        error
      );
    }
    return toEntity(data as InsightRow);
  }

  async markAsResolved(id: InsightId): Promise<Insight> {
    const { data, error } = await this.client
      .from(TABLE)
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new RepositoryError(
        `Falha ao resolver insight: ${error.message} `,
        "UPDATE_FAILED",
        error
      );
    }
    return toEntity(data as InsightRow);
  }
}
