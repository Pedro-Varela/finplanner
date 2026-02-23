"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseTransactionRepository } from "@/lib/repositories/transaction-repository";
import { GetFinancialForecast } from "@/core/usecases";
import type { ForecastData } from "@/core/entities/forecast";

export type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

export async function getForecastAction(months: 6 | 12): Promise<ActionResult<ForecastData>> {
    try {
        const client = createClient();
        const transactionRepo = new SupabaseTransactionRepository(client);

        const usecase = new GetFinancialForecast({ transactionRepo });
        const data = await usecase.execute(months);

        return { success: true, data };
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Erro ao gerar forecast financeiro";
        return { success: false, error: msg };
    }
}
