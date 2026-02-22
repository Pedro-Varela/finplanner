import type { CategoryId, UserId } from "./id";

export type CategoryType = "income" | "expense";

export interface Category {
  id: CategoryId;
  userId: UserId;
  name: string;
  type: CategoryType;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
}

export interface UpdateCategoryInput {
  name?: string;
  type?: CategoryType;
}
