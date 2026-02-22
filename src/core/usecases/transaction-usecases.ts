import type {
  Transaction,
  TransactionId,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../entities";
import { ValidationError } from "../errors";

// ---------------------------------------------------------------------------
// Repository interface (implementada em lib/)
// ---------------------------------------------------------------------------

export interface TransactionRepository {
  findAll(): Promise<Transaction[]>;
  findById(id: TransactionId): Promise<Transaction | null>;
  create(data: CreateTransactionInput): Promise<Transaction>;
  update(id: TransactionId, data: UpdateTransactionInput): Promise<Transaction>;
  delete(id: TransactionId): Promise<void>;
}

// ---------------------------------------------------------------------------
// Validação compartilhada
// ---------------------------------------------------------------------------

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateAmount(amount: number) {
  if (amount <= 0) {
    throw new ValidationError("O valor deve ser maior que zero.", "amount");
  }
}

function validateDescription(description: string) {
  if (!description.trim()) {
    throw new ValidationError("A descrição é obrigatória.", "description");
  }
}

function validateDate(date: string) {
  if (!ISO_DATE_RE.test(date) || isNaN(Date.parse(date))) {
    throw new ValidationError("A data deve estar no formato YYYY-MM-DD.", "date");
  }
}

// ---------------------------------------------------------------------------
// Use cases
// ---------------------------------------------------------------------------

export class ListTransactions {
  constructor(private repository: TransactionRepository) {}

  async execute(): Promise<Transaction[]> {
    return this.repository.findAll();
  }
}

export class CreateTransaction {
  constructor(private repository: TransactionRepository) {}

  async execute(data: CreateTransactionInput): Promise<Transaction> {
    validateDescription(data.description);
    validateAmount(data.amount);
    validateDate(data.date);

    return this.repository.create(data);
  }
}

export class UpdateTransaction {
  constructor(private repository: TransactionRepository) {}

  async execute(id: TransactionId, data: UpdateTransactionInput): Promise<Transaction> {
    if (data.description !== undefined) validateDescription(data.description);
    if (data.amount !== undefined) validateAmount(data.amount);
    if (data.date !== undefined) validateDate(data.date);

    const hasFields = Object.values(data).some((v) => v !== undefined);
    if (!hasFields) {
      throw new ValidationError("Nenhum campo para atualizar foi informado.");
    }

    return this.repository.update(id, data);
  }
}

export class DeleteTransaction {
  constructor(private repository: TransactionRepository) {}

  async execute(id: TransactionId): Promise<void> {
    return this.repository.delete(id);
  }
}
