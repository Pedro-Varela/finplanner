import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryRepository } from "@/core/usecases";
import type {
  Category,
  CategoryId,
  UserId,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/core/entities";
import type { CategoryRow } from "./database-types";
import { RepositoryError } from "./errors";

const TABLE = "categories";

// ---------------------------------------------------------------------------
// Mapper: Row (snake_case) → Entity (camelCase)
// ---------------------------------------------------------------------------

function toEntity(row: CategoryRow): Category {
  return {
    id: row.id as CategoryId,
    userId: row.user_id as UserId,
    name: row.name,
    color: row.color,
    icon: row.icon ?? undefined,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Repository — apenas acesso a dados, zero lógica de negócio
// ---------------------------------------------------------------------------

export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private client: SupabaseClient) {}

  async findAll(): Promise<Category[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw new RepositoryError(
        `Falha ao listar categorias: ${error.message}`,
        "QUERY_FAILED",
        error
      );
    }

    return (data as CategoryRow[]).map(toEntity);
  }

  async findById(id: CategoryId): Promise<Category | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new RepositoryError(
        `Falha ao buscar categoria ${id}: ${error.message}`,
        "QUERY_FAILED",
        error
      );
    }

    return toEntity(data as CategoryRow);
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        name: input.name,
        color: input.color,
        icon: input.icon ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new RepositoryError(
        `Falha ao criar categoria: ${error.message}`,
        "CREATE_FAILED",
        error
      );
    }

    return toEntity(data as CategoryRow);
  }

  async update(id: CategoryId, input: UpdateCategoryInput): Promise<Category> {
    const row: Record<string, unknown> = {};
    if (input.name !== undefined) row.name = input.name;
    if (input.color !== undefined) row.color = input.color;
    if (input.icon !== undefined) row.icon = input.icon;

    const { data, error } = await this.client
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new RepositoryError(`Categoria ${id} não encontrada.`, "NOT_FOUND", error);
      }
      throw new RepositoryError(
        `Falha ao atualizar categoria ${id}: ${error.message}`,
        "UPDATE_FAILED",
        error
      );
    }

    return toEntity(data as CategoryRow);
  }

  async delete(id: CategoryId): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);

    if (error) {
      throw new RepositoryError(
        `Falha ao remover categoria ${id}: ${error.message}`,
        "DELETE_FAILED",
        error
      );
    }
  }
}
