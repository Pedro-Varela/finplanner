"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseTransactionRepository, SupabaseCategoryRepository } from "@/lib/repositories";
import { GetDashboardSummary } from "@/core/usecases";
import type { DashboardData } from "@/core/usecases";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getDashboardDataAction(): Promise<ActionResult<DashboardData>> {
  try {
    const supabase = createClient();
    const data = await new GetDashboardSummary(
      new SupabaseTransactionRepository(supabase),
      new SupabaseCategoryRepository(supabase)
    ).execute();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
