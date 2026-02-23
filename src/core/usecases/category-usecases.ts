import {
  CATEGORY_ICON_OPTIONS,
  type Category,
  type CategoryId,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../entities";
import { ValidationError } from "../errors";

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: CategoryId): Promise<Category | null>;
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: CategoryId, data: UpdateCategoryInput): Promise<Category>;
  delete(id: CategoryId): Promise<void>;
}

function validateName(name: string) {
  if (!name.trim()) {
    throw new ValidationError("O nome da categoria é obrigatório.", "name");
  }
  if (name.trim().length > 50) {
    throw new ValidationError("O nome deve ter no máximo 50 caracteres.", "name");
  }
}

function validateIcon(icon: string | undefined) {
  if (icon === undefined) return;

  if (!CATEGORY_ICON_OPTIONS.includes(icon as (typeof CATEGORY_ICON_OPTIONS)[number])) {
    throw new ValidationError("O ícone selecionado é inválido.", "icon");
  }
}

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
    validateIcon(data.icon);
    return this.repository.create(data);
  }
}

export class UpdateCategory {
  constructor(private repository: CategoryRepository) {}

  async execute(id: CategoryId, data: UpdateCategoryInput): Promise<Category> {
    if (data.name !== undefined) validateName(data.name);
    validateIcon(data.icon);

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
