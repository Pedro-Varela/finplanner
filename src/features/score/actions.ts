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
  selectedMonth: string;
  availableMonths: string[];
}

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export interface GetFinancialScoreDataInput {
  monthRef?: string;
}

function currentMonthRef(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function listAvailableMonths(dates: string[]): string[] {
  const monthRefs = new Set(dates.map((date) => date.slice(0, 7)));
  monthRefs.add(currentMonthRef());
  return Array.from(monthRefs).sort((a, b) => b.localeCompare(a));
}

function latestTransactionMonth(dates: string[]): string | null {
  if (dates.length === 0) return null;
  const latestDate = dates.reduce((max, date) => (date > max ? date : max));
  return latestDate.slice(0, 7);
}

export async function getFinancialScoreDataAction(
  input?: GetFinancialScoreDataInput
): Promise<ActionResult<FinancialScoreData>> {
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

    const transactionDates = transactions.map((transaction) => transaction.date);
    const availableMonths = listAvailableMonths(transactionDates);
    const defaultMonth = latestTransactionMonth(transactionDates) ?? currentMonthRef();
    const selectedMonth =
      input?.monthRef && availableMonths.includes(input.monthRef) ? input.monthRef : defaultMonth;

    const snapshot = generateFinancialSnapshot(transactions, categories, recurring, {
      referenceMonth: selectedMonth,
    });
    const score = calculateFinancialScore(snapshot);

    return {
      success: true,
      data: {
        snapshot,
        score,
        selectedMonth,
        availableMonths,
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
