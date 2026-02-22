"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SupabaseAccountRepository } from "@/lib/repositories";
import { ListAccounts, CreateAccount, UpdateAccount, DeleteAccount } from "@/core/usecases";
import type { AccountId, Account, AccountType } from "@/core/entities";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

function repo() {
  return new SupabaseAccountRepository(createClient());
}

export async function listAccountsAction(): Promise<ActionResult<Account[]>> {
  try {
    return { success: true, data: await new ListAccounts(repo()).execute() };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createAccountAction(formData: {
  name: string;
  type: string;
}): Promise<ActionResult<Account>> {
  try {
    const account = await new CreateAccount(repo()).execute({
      name: formData.name,
      type: formData.type as AccountType,
    });
    revalidatePath("/accounts");
    return { success: true, data: account };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateAccountAction(
  id: string,
  formData: { name: string; type: string }
): Promise<ActionResult<Account>> {
  try {
    const account = await new UpdateAccount(repo()).execute(id as AccountId, {
      name: formData.name,
      type: formData.type as AccountType,
    });
    revalidatePath("/accounts");
    return { success: true, data: account };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteAccountAction(id: string): Promise<ActionResult> {
  try {
    await new DeleteAccount(repo()).execute(id as AccountId);
    revalidatePath("/accounts");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
