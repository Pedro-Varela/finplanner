"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SupabaseTransactionRepository, SupabaseCategoryRepository } from "@/lib/repositories";
import {
  ListTransactions,
  CreateTransaction,
  UpdateTransaction,
  DeleteTransaction,
  ListCategories,
} from "@/core/usecases";
import type { TransactionId, CategoryId, Transaction, Category } from "@/core/entities";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

function repo() {
  return new SupabaseTransactionRepository(createClient());
}

export async function listTransactionsAction(): Promise<ActionResult<Transaction[]>> {
  try {
    const transactions = await new ListTransactions(repo()).execute();
    return { success: true, data: transactions };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createTransactionAction(
  formData: Record<string, unknown>
): Promise<ActionResult<Transaction>> {
  try {
    const transaction = await new CreateTransaction(repo()).execute({
      description: formData.description as string,
      amount: formData.amount as number,
      type: formData.type as "income" | "expense",
      categoryId: formData.categoryId as CategoryId,
      date: formData.date as string,
    });
    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true, data: transaction };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateTransactionAction(
  id: string,
  formData: Record<string, unknown>
): Promise<ActionResult<Transaction>> {
  try {
    const transaction = await new UpdateTransaction(repo()).execute(id as TransactionId, {
      description: formData.description as string,
      amount: formData.amount as number,
      type: formData.type as "income" | "expense",
      categoryId: formData.categoryId as CategoryId,
      date: formData.date as string,
    });
    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true, data: transaction };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  try {
    await new DeleteTransaction(repo()).execute(id as TransactionId);
    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function listCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    const supabase = createClient();
    const categories = await new ListCategories(new SupabaseCategoryRepository(supabase)).execute();
    return { success: true, data: categories };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
