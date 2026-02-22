import type { Account, AccountId, CreateAccountInput, UpdateAccountInput } from "../entities";
import { ValidationError } from "../errors";

export interface AccountRepository {
  findAll(): Promise<Account[]>;
  findById(id: AccountId): Promise<Account | null>;
  create(data: CreateAccountInput): Promise<Account>;
  update(id: AccountId, data: UpdateAccountInput): Promise<Account>;
  delete(id: AccountId): Promise<void>;
}

export class ListAccounts {
  constructor(private repository: AccountRepository) {}

  async execute(): Promise<Account[]> {
    return this.repository.findAll();
  }
}

export class CreateAccount {
  constructor(private repository: AccountRepository) {}

  async execute(data: CreateAccountInput): Promise<Account> {
    if (!data.name.trim()) {
      throw new ValidationError("O nome da conta é obrigatório.", "name");
    }
    return this.repository.create(data);
  }
}

export class UpdateAccount {
  constructor(private repository: AccountRepository) {}

  async execute(id: AccountId, data: UpdateAccountInput): Promise<Account> {
    if (data.name !== undefined && !data.name.trim()) {
      throw new ValidationError("O nome da conta é obrigatório.", "name");
    }
    return this.repository.update(id, data);
  }
}

export class DeleteAccount {
  constructor(private repository: AccountRepository) {}

  async execute(id: AccountId): Promise<void> {
    return this.repository.delete(id);
  }
}
