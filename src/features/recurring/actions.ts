"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SupabaseRecurringRepository } from "@/lib/repositories";
import { ListRecurring, CreateRecurring, ToggleRecurring, DeleteRecurring } from "@/core/usecases";
import type {
  RecurringTransactionId,
  CategoryId,
  RecurringTransaction,
  RecurringFrequency,
} from "@/core/entities";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

function repo() {
  return new SupabaseRecurringRepository(createClient());
}

export async function listRecurringAction(): Promise<ActionResult<RecurringTransaction[]>> {
  try {
    return { success: true, data: await new ListRecurring(repo()).execute() };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createRecurringAction(formData: {
  title: string;
  amount: number;
  categoryId: string;
  frequency: string;
  nextDate: string;
}): Promise<ActionResult<RecurringTransaction>> {
  try {
    const data = await new CreateRecurring(repo()).execute({
      title: formData.title,
      amount: formData.amount,
      categoryId: formData.categoryId as CategoryId,
      frequency: formData.frequency as RecurringFrequency,
      nextDate: formData.nextDate,
    });
    revalidatePath("/recurring");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function toggleRecurringAction(
  id: string,
  active: boolean
): Promise<ActionResult<RecurringTransaction>> {
  try {
    const data = await new ToggleRecurring(repo()).execute(id as RecurringTransactionId, active);
    revalidatePath("/recurring");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteRecurringAction(id: string): Promise<ActionResult> {
  try {
    await new DeleteRecurring(repo()).execute(id as RecurringTransactionId);
    revalidatePath("/recurring");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
