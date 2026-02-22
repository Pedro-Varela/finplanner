import type { CategoryId, UserId } from "./id";

// ---------------------------------------------------------------------------
// Entity — modelo de domínio completo
// ---------------------------------------------------------------------------

export interface Category {
  id: CategoryId;
  userId: UserId;
  name: string;
  color: string;
  icon?: string;
  createdAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// DTOs — contratos de entrada
// ---------------------------------------------------------------------------

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
}
