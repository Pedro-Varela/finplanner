"use server";

import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export async function updatePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return { success: false, error: "Utilizador não autenticado." };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      return { success: false, error: "Senha atual incorreta." };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
