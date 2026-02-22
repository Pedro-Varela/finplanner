"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCategoryRepository } from "@/lib/repositories";
import { ListCategories, CreateCategory, UpdateCategory, DeleteCategory } from "@/core/usecases";
import type { CategoryId, Category } from "@/core/entities";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

function repo() {
  return new SupabaseCategoryRepository(createClient());
}

export async function listCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    const categories = await new ListCategories(repo()).execute();
    return { success: true, data: categories };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createCategoryAction(
  formData: Record<string, unknown>
): Promise<ActionResult<Category>> {
  try {
    const category = await new CreateCategory(repo()).execute({
      name: formData.name as string,
      type: formData.type as "income" | "expense",
    });
    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true, data: category };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateCategoryAction(
  id: string,
  formData: Record<string, unknown>
): Promise<ActionResult<Category>> {
  try {
    const category = await new UpdateCategory(repo()).execute(id as CategoryId, {
      name: formData.name as string,
      type: formData.type as "income" | "expense",
    });
    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true, data: category };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await new DeleteCategory(repo()).execute(id as CategoryId);
    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
