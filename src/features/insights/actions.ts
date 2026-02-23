"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { SupabaseInsightRepository } from "@/lib/repositories/insight-repository";
import { SupabaseTransactionRepository } from "@/lib/repositories/transaction-repository";
import { SupabaseCategoryRepository } from "@/lib/repositories/category-repository";
import { SupabaseRecurringRepository } from "@/lib/repositories/recurring-repository";
import { SupabaseFinancialIntelligenceRepository } from "@/lib/repositories/financial-intelligence-repository";
import { GenerateFinancialIntelligence } from "@/core/usecases/financial-intelligence-usecases";
import type { Insight, InsightId } from "@/core/entities/insight";

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getInsightsAction(): Promise<ActionResult<Insight[]>> {
  try {
    const client = createClient();
    const repo = new SupabaseInsightRepository(client);
    const insights = await repo.findAllActive();
    return { success: true, data: insights };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao carregar insights";
    return { success: false, error: msg };
  }
}

export async function generateInsightsAction(): Promise<ActionResult<void>> {
  try {
    const client = createClient();
    const transactionRepo = new SupabaseTransactionRepository(client);
    const categoryRepo = new SupabaseCategoryRepository(client);
    const recurringRepo = new SupabaseRecurringRepository(client);
    const persistenceRepo = new SupabaseFinancialIntelligenceRepository(client);

    const usecase = new GenerateFinancialIntelligence({
      transactionRepo,
      categoryRepo,
      recurringRepo,
      persistenceRepo,
    });

    await usecase.execute();
    revalidatePath("/insights");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao gerar insights";
    return { success: false, error: msg };
  }
}

export async function resolveInsightAction(id: InsightId): Promise<ActionResult<void>> {
  try {
    const client = createClient();
    const repo = new SupabaseInsightRepository(client);
    await repo.markAsResolved(id);
    revalidatePath("/insights");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao resolver insight";
    return { success: false, error: msg };
  }
}
