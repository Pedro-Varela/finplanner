"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  SupabaseBudgetRepository,
  SupabaseTransactionRepository,
  SupabaseCategoryRepository,
} from "@/lib/repositories";
import { SetBudget, DeleteBudget, GetBudgetProgress } from "@/core/usecases";
import type { BudgetId, CategoryId, Budget, BudgetProgress } from "@/core/entities";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

function repos() {
  const supabase = createClient();
  return {
    budget: new SupabaseBudgetRepository(supabase),
    transaction: new SupabaseTransactionRepository(supabase),
    category: new SupabaseCategoryRepository(supabase),
  };
}

export async function getBudgetProgressAction(
  month: number,
  year: number
): Promise<ActionResult<BudgetProgress[]>> {
  try {
    const r = repos();
    const data = await new GetBudgetProgress(r.budget, r.transaction, r.category).execute(
      month,
      year
    );
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function setBudgetAction(formData: {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}): Promise<ActionResult<Budget>> {
  try {
    const budget = await new SetBudget(repos().budget).execute({
      categoryId: formData.categoryId as CategoryId,
      amount: formData.amount,
      month: formData.month,
      year: formData.year,
    });
    revalidatePath("/budgets");
    revalidatePath("/");
    return { success: true, data: budget };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteBudgetAction(id: string): Promise<ActionResult> {
  try {
    await new DeleteBudget(repos().budget).execute(id as BudgetId);
    revalidatePath("/budgets");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
