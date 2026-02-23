"use server";

import { createClient } from "@/lib/supabase/server";
import {
  SupabaseCategoryRepository,
  SupabaseRecurringRepository,
  SupabaseTransactionRepository,
} from "@/lib/repositories";
import {
  calculateFinancialScore,
  generateFinancialSnapshot,
  type FinancialScore,
  type FinancialSnapshot,
} from "@/core/financial-intelligence";

export interface FinancialScoreData {
  snapshot: FinancialSnapshot;
  score: FinancialScore;
}

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getFinancialScoreDataAction(): Promise<ActionResult<FinancialScoreData>> {
  try {
    const client = createClient();
    const transactionRepo = new SupabaseTransactionRepository(client);
    const categoryRepo = new SupabaseCategoryRepository(client);
    const recurringRepo = new SupabaseRecurringRepository(client);

    const [transactions, categories, recurring] = await Promise.all([
      transactionRepo.findAll(),
      categoryRepo.findAll(),
      recurringRepo.findAll(),
    ]);

    const snapshot = generateFinancialSnapshot(transactions, categories, recurring);
    const score = calculateFinancialScore(snapshot);

    return {
      success: true,
      data: {
        snapshot,
        score,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro ao carregar o score financeiro.";

    return {
      success: false,
      error: message,
    };
  }
}
