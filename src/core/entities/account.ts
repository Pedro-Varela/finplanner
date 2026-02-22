import type { UserId } from "./id";

type Brand<T, B extends string> = T & { readonly __brand: B };
export type AccountId = Brand<string, "AccountId">;

export type AccountType = "checking" | "savings" | "credit_card";

export interface Account {
  id: AccountId;
  userId: UserId;
  name: string;
  type: AccountType;
  createdAt: string;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
}
