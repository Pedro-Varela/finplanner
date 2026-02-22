import type {
  RecurringTransaction,
  RecurringTransactionId,
  CreateRecurringInput,
  UpdateRecurringInput,
} from "../entities";
import { ValidationError } from "../errors";

export interface RecurringTransactionRepository {
  findAll(): Promise<RecurringTransaction[]>;
  create(data: CreateRecurringInput): Promise<RecurringTransaction>;
  update(id: RecurringTransactionId, data: UpdateRecurringInput): Promise<RecurringTransaction>;
  delete(id: RecurringTransactionId): Promise<void>;
}

export class ListRecurring {
  constructor(private repository: RecurringTransactionRepository) {}

  async execute(): Promise<RecurringTransaction[]> {
    return this.repository.findAll();
  }
}

export class CreateRecurring {
  constructor(private repository: RecurringTransactionRepository) {}

  async execute(data: CreateRecurringInput): Promise<RecurringTransaction> {
    if (!data.title.trim()) {
      throw new ValidationError("O título é obrigatório.", "title");
    }
    if (data.amount <= 0) {
      throw new ValidationError("O valor deve ser positivo.", "amount");
    }
    return this.repository.create(data);
  }
}

export class ToggleRecurring {
  constructor(private repository: RecurringTransactionRepository) {}

  async execute(id: RecurringTransactionId, active: boolean): Promise<RecurringTransaction> {
    return this.repository.update(id, { active });
  }
}

export class DeleteRecurring {
  constructor(private repository: RecurringTransactionRepository) {}

  async execute(id: RecurringTransactionId): Promise<void> {
    return this.repository.delete(id);
  }
}
