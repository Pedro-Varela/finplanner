"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseAuthRepository } from "@/lib/repositories";
import { SignIn, SignUp, SignOut } from "@/core/usecases";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();
  const repository = new SupabaseAuthRepository(supabase);
  const signIn = new SignIn(repository);

  const result = await signIn.execute({ email, password });

  if (result.error) {
    return { error: result.error };
  }

  redirect("/");
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();
  const repository = new SupabaseAuthRepository(supabase);
  const signUp = new SignUp(repository);

  const result = await signUp.execute({ email, password });

  if (result.error) {
    return { error: result.error };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = createClient();
  const repository = new SupabaseAuthRepository(supabase);
  const signOut = new SignOut(repository);

  await signOut.execute();
  redirect("/login");
}
