"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SupabaseTransactionRepository, SupabaseMerchantRuleRepository } from "@/lib/repositories";
import { ImportNubankCsvTransactions } from "@/core/usecases";
import type { ImportResult, Category } from "@/core/entities";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export interface PreviewRule {
  pattern: string;
  matchType: "equals" | "contains" | "regex";
  categoryId: string | null;
  priority: number;
}

export async function importNubankCsvAction(
  csvContent: string,
  sourceType: "bank_account" | "credit_card"
): Promise<ActionResult<ImportResult>> {
  try {
    const client = createClient();
    const txRepo = new SupabaseTransactionRepository(client);
    const ruleRepo = new SupabaseMerchantRuleRepository(client);

    const useCase = new ImportNubankCsvTransactions(txRepo, ruleRepo);
    const result = await useCase.execute(csvContent, sourceType);

    revalidatePath("/transactions");
    revalidatePath("/");

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function listMerchantRulesForPreviewAction(): Promise<ActionResult<PreviewRule[]>> {
  try {
    const client = createClient();
    const ruleRepo = new SupabaseMerchantRuleRepository(client);
    const rules = await ruleRepo.findAllForUser();

    const serializable: PreviewRule[] = rules.map((r) => ({
      pattern: r.pattern,
      matchType: r.matchType,
      categoryId: r.categoryId as string | null,
      priority: r.priority,
    }));

    return { success: true, data: serializable };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function listCategoriesForImportAction(): Promise<ActionResult<Category[]>> {
  try {
    const client = createClient();
    const { SupabaseCategoryRepository } = await import("@/lib/repositories");
    const { ListCategories } = await import("@/core/usecases");
    const catRepo = new SupabaseCategoryRepository(client);
    const categories = await new ListCategories(catRepo).execute();
    return { success: true, data: categories };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
