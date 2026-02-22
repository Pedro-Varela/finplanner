import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthRepository,
  SignInCredentials,
  SignUpCredentials,
  AuthResult,
} from "@/core/usecases";
import type { User, UserId } from "@/core/entities";

function mapUser(supabaseUser: { id: string; email?: string; created_at: string }): User {
  return {
    id: supabaseUser.id as UserId,
    email: supabaseUser.email ?? "",
    createdAt: supabaseUser.created_at,
  };
}

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private client: SupabaseClient) {}

  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: mapUser(data.user), error: null };
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "Erro ao criar conta." };
    }

    return { user: mapUser(data.user), error: null };
  }

  async signOut(): Promise<{ error: string | null }> {
    const { error } = await this.client.auth.signOut();
    return { error: error?.message ?? null };
  }

  async getUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.client.auth.getUser();

    if (!user) return null;
    return mapUser(user);
  }
}
