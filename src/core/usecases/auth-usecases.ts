import type { User } from "../entities";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export interface AuthRepository {
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signUp(credentials: SignUpCredentials): Promise<AuthResult>;
  signOut(): Promise<{ error: string | null }>;
  getUser(): Promise<User | null>;
}

export class SignIn {
  constructor(private repository: AuthRepository) {}

  async execute(credentials: SignInCredentials): Promise<AuthResult> {
    if (!credentials.email.trim()) {
      return { user: null, error: "O email é obrigatório." };
    }
    if (!credentials.password) {
      return { user: null, error: "A senha é obrigatória." };
    }
    return this.repository.signIn(credentials);
  }
}

export class SignUp {
  constructor(private repository: AuthRepository) {}

  async execute(credentials: SignUpCredentials): Promise<AuthResult> {
    if (!credentials.email.trim()) {
      return { user: null, error: "O email é obrigatório." };
    }
    if (credentials.password.length < 6) {
      return { user: null, error: "A senha deve ter no mínimo 6 caracteres." };
    }
    return this.repository.signUp(credentials);
  }
}

export class SignOut {
  constructor(private repository: AuthRepository) {}

  async execute(): Promise<{ error: string | null }> {
    return this.repository.signOut();
  }
}

export class GetCurrentUser {
  constructor(private repository: AuthRepository) {}

  async execute(): Promise<User | null> {
    return this.repository.getUser();
  }
}
