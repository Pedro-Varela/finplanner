import type {
  Transaction,
  TransactionId,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
} from "../entities";
import { ValidationError } from "../errors";

export interface TransactionRepository {
  findAll(filters?: TransactionFilters): Promise<Transaction[]>;
  findById(id: TransactionId): Promise<Transaction | null>;
  create(data: CreateTransactionInput): Promise<Transaction>;
  update(id: TransactionId, data: UpdateTransactionInput): Promise<Transaction>;
  delete(id: TransactionId): Promise<void>;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateAmount(amount: number) {
  if (amount <= 0) {
    throw new ValidationError("O valor deve ser maior que zero.", "amount");
  }
}

function validateTitle(title: string) {
  if (!title.trim()) {
    throw new ValidationError("O título é obrigatório.", "title");
  }
}

function validateDate(date: string) {
  if (!ISO_DATE_RE.test(date) || isNaN(Date.parse(date))) {
    throw new ValidationError("A data deve estar no formato YYYY-MM-DD.", "date");
  }
}

export class ListTransactions {
  constructor(private repository: TransactionRepository) {}

  async execute(filters?: TransactionFilters): Promise<Transaction[]> {
    return this.repository.findAll(filters);
  }
}

export class CreateTransaction {
  constructor(private repository: TransactionRepository) {}

  async execute(data: CreateTransactionInput): Promise<Transaction> {
    validateTitle(data.title);
    validateAmount(data.amount);
    validateDate(data.date);
    return this.repository.create(data);
  }
}

export class UpdateTransaction {
  constructor(private repository: TransactionRepository) {}

  async execute(id: TransactionId, data: UpdateTransactionInput): Promise<Transaction> {
    if (data.title !== undefined) validateTitle(data.title);
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
