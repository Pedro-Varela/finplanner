"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseTransactionRepository } from "@/lib/repositories/transaction-repository";
import { SupabaseCategoryRepository } from "@/lib/repositories/category-repository";
import { GetProjections } from "@/core/usecases";
import type { ProjectionsData } from "@/core/usecases";

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getProjectionsAction(): Promise<ActionResult<ProjectionsData>> {
  try {
    const client = createClient();

    const txRepo = new SupabaseTransactionRepository(client);
    const catRepo = new SupabaseCategoryRepository(client);

    const useCase = new GetProjections(txRepo, catRepo);
    const result = await useCase.execute();

    return { success: true, data: result };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro ao carregar as projeções.";
    return {
      success: false,
      error: message,
    };
  }
}
