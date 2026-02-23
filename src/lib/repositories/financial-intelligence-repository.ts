import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FinancialIntelligencePersistenceRepository,
  GenerateFinancialIntelligenceResult,
} from "@/core/usecases/financial-intelligence-usecases";
import type { CreateInsightInput } from "@/core/entities";
import { RepositoryError } from "./errors";

const TABLE = "insights";

export class SupabaseFinancialIntelligenceRepository implements FinancialIntelligencePersistenceRepository {
  constructor(private client: SupabaseClient) {}

  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.client.auth.getUser();

    if (!user) {
      throw new RepositoryError("Utilizador não autenticado.", "QUERY_FAILED");
    }

    return user.id;
  }

  async findActiveInsightTitles(): Promise<Set<string>> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from(TABLE)
      .select("title")
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) {
      throw new RepositoryError(
        `Falha ao listar títulos ativos: ${error.message}`,
        "QUERY_FAILED",
        error
      );
    }

    return new Set((data ?? []).map((row) => String(row.title)));
  }

  async createInsights(inputs: CreateInsightInput[]): Promise<void> {
    if (inputs.length === 0) return;

    const userId = await this.getUserId();
    const { error } = await this.client.from(TABLE).insert(
      inputs.map((input) => ({
        user_id: userId,
        title: input.title,
        description: input.description,
        type: input.type,
        status: "active",
      }))
    );

    if (error) {
      throw new RepositoryError(
        `Falha ao salvar insights: ${error.message}`,
        "CREATE_FAILED",
        error
      );
    }
  }

  async saveAnalysis(_payload: GenerateFinancialIntelligenceResult): Promise<void> {
    // Persistência analítica dedicada (snapshot/score/envelope) pode ser adicionada
    // aqui quando a tabela de histórico estiver disponível.
  }
}
