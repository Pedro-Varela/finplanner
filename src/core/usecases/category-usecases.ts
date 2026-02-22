import type { Category, CategoryId, CreateCategoryInput, UpdateCategoryInput } from "../entities";
import { ValidationError } from "../errors";

// ---------------------------------------------------------------------------
// Repository interface (implementada em lib/)
// ---------------------------------------------------------------------------

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: CategoryId): Promise<Category | null>;
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: CategoryId, data: UpdateCategoryInput): Promise<Category>;
  delete(id: CategoryId): Promise<void>;
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function validateName(name: string) {
  if (!name.trim()) {
    throw new ValidationError("O nome da categoria é obrigatório.", "name");
  }
  if (name.trim().length > 50) {
    throw new ValidationError("O nome deve ter no máximo 50 caracteres.", "name");
  }
}

function validateColor(color: string) {
  if (!color.trim()) {
    throw new ValidationError("A cor é obrigatória.", "color");
  }
  if (!HEX_COLOR_RE.test(color)) {
    throw new ValidationError("A cor deve estar no formato hex (#RRGGBB).", "color");
  }
}

// ---------------------------------------------------------------------------
// Use cases
// ---------------------------------------------------------------------------

export class ListCategories {
  constructor(private repository: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    return this.repository.findAll();
  }
}

export class CreateCategory {
  constructor(private repository: CategoryRepository) {}

  async execute(data: CreateCategoryInput): Promise<Category> {
    validateName(data.name);
    validateColor(data.color);
    return this.repository.create(data);
  }
}

export class UpdateCategory {
  constructor(private repository: CategoryRepository) {}

  async execute(id: CategoryId, data: UpdateCategoryInput): Promise<Category> {
    if (data.name !== undefined) validateName(data.name);
    if (data.color !== undefined) validateColor(data.color);

    const hasFields = Object.values(data).some((v) => v !== undefined);
    if (!hasFields) {
      throw new ValidationError("Nenhum campo para atualizar foi informado.");
    }

    return this.repository.update(id, data);
  }
}

export class DeleteCategory {
  constructor(private repository: CategoryRepository) {}

  async execute(id: CategoryId): Promise<void> {
    return this.repository.delete(id);
  }
}
