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
import type {
  TransactionId,
  CategoryId,
  Transaction,
  Category,
  TransactionFilters,
} from "@/core/entities";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

function txRepo() {
  return new SupabaseTransactionRepository(createClient());
}

function catRepo() {
  return new SupabaseCategoryRepository(createClient());
}

async function resolveTypeFromCategory(categoryId: string): Promise<"income" | "expense"> {
  const cat = await catRepo().findById(categoryId as CategoryId);
  if (!cat) throw new Error("Categoria não encontrada.");
  return cat.type;
}

export async function listTransactionsAction(
  filters?: TransactionFilters
): Promise<ActionResult<Transaction[]>> {
  try {
    return { success: true, data: await new ListTransactions(txRepo()).execute(filters) };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createTransactionAction(
  formData: Record<string, unknown>
): Promise<ActionResult<Transaction>> {
  try {
    const type = await resolveTypeFromCategory(formData.categoryId as string);
    const transaction = await new CreateTransaction(txRepo()).execute({
      title: formData.title as string,
      amount: formData.amount as number,
      type,
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
    const type = await resolveTypeFromCategory(formData.categoryId as string);
    const transaction = await new UpdateTransaction(txRepo()).execute(id as TransactionId, {
      title: formData.title as string,
      amount: formData.amount as number,
      type,
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
    await new DeleteTransaction(txRepo()).execute(id as TransactionId);
    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function listCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    return { success: true, data: await new ListCategories(catRepo()).execute() };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
