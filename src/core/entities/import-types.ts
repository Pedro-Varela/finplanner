import type { CategoryId } from "./id";
import type { TransactionType } from "./transaction";

export interface BulkTransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: CategoryId | null;
  date: string;
  source: "import_csv";
  importedHash: string;
  normalizedMerchant?: string;
}

export interface ImportResult {
  inserted: number;
  skippedDuplicates: number;
  categorized: number;
  errors: { line: number; reason: string }[];
}
