import type { CategoryId, BulkTransactionInput, ImportResult, MerchantRule } from "../entities";
import type { RuleInput } from "@/lib/categorization/apply-rules";
import { importNubankCsv } from "@/lib/importers";
import { extractMerchantBase } from "@/lib/categorization";
import { applyRules } from "@/lib/categorization";

// ---------------------------------------------------------------------------
// Hash determinístico (sem dependência de crypto externo)
// ---------------------------------------------------------------------------

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  const h2 = input.split("").reduce((a, c) => ((a << 7) - a + c.charCodeAt(0)) | 0, 0);
  return hex + (h2 >>> 0).toString(16).padStart(8, "0");
}

function generateImportHash(date: string, amount: number, merchantBase: string): string {
  return simpleHash(`${date}|${amount}|${merchantBase}`);
}

// ---------------------------------------------------------------------------
// Interfaces de repositórios esperados (evita importar Supabase no core)
// ---------------------------------------------------------------------------

export interface ImportTransactionRepository {
  findByImportedHashes(hashes: string[]): Promise<Set<string>>;
  bulkInsert(items: BulkTransactionInput[]): Promise<number>;
}

export interface ImportMerchantRuleRepository {
  findAllForUser(): Promise<MerchantRule[]>;
}

// ---------------------------------------------------------------------------
// Use case: Importar CSV do Nubank
// ---------------------------------------------------------------------------

export class ImportNubankCsvTransactions {
  constructor(
    private txRepo: ImportTransactionRepository,
    private ruleRepo: ImportMerchantRuleRepository
  ) {}

  async execute(csvContent: string): Promise<ImportResult> {
    const { rows: parsedRows, errors: parseErrors } = importNubankCsv(csvContent);

    if (parsedRows.length === 0) {
      return {
        inserted: 0,
        skippedDuplicates: 0,
        categorized: 0,
        errors: parseErrors,
      };
    }

    // Enriquecer cada row com merchantBase e hash
    const enriched = parsedRows.map((row) => {
      const merchantBase = extractMerchantBase(row.description);
      const hash = generateImportHash(row.date, row.amount, merchantBase);
      const type = row.amount < 0 ? "expense" : "income";
      return { ...row, merchantBase, hash, type: type as "income" | "expense" };
    });

    // Deduplicar contra o banco
    const allHashes = enriched.map((r) => r.hash);
    const existingHashes = await this.txRepo.findByImportedHashes(allHashes);
    const newRows = enriched.filter((r) => !existingHashes.has(r.hash));
    const skippedDuplicates = enriched.length - newRows.length;

    if (newRows.length === 0) {
      return {
        inserted: 0,
        skippedDuplicates,
        categorized: 0,
        errors: parseErrors,
      };
    }

    // Buscar regras do user e aplicar categorização
    const merchantRules = await this.ruleRepo.findAllForUser();
    const ruleInputs: RuleInput[] = merchantRules.map((r) => ({
      pattern: r.pattern,
      matchType: r.matchType,
      categoryId: r.categoryId,
      priority: r.priority,
    }));

    let categorized = 0;

    const bulkItems: BulkTransactionInput[] = newRows.map((row) => {
      const catId = applyRules(row.merchantBase, ruleInputs);
      if (catId) categorized++;

      return {
        title: row.description,
        amount: Math.abs(row.amount),
        type: row.type,
        categoryId: (catId as CategoryId) ?? (null as unknown as CategoryId),
        date: row.date,
        source: "import_csv" as const,
        importedHash: row.hash,
      };
    });

    const inserted = await this.txRepo.bulkInsert(bulkItems);

    return {
      inserted,
      skippedDuplicates,
      categorized,
      errors: parseErrors,
    };
  }
}

// ---------------------------------------------------------------------------
// Use case: Criar regra de merchant a partir de uma transação
// ---------------------------------------------------------------------------

export interface CreateRuleRepository {
  create(data: {
    pattern: string;
    matchType: "equals" | "contains" | "regex";
    categoryId: CategoryId | null;
    priority?: number;
  }): Promise<MerchantRule>;
}

export class CreateMerchantRuleFromTransaction {
  constructor(private ruleRepo: CreateRuleRepository) {}

  async execute(merchantBase: string, categoryId: CategoryId): Promise<MerchantRule> {
    if (!merchantBase.trim()) {
      throw new Error("O merchant base é obrigatório.");
    }

    return this.ruleRepo.create({
      pattern: merchantBase.toUpperCase(),
      matchType: "contains",
      categoryId,
      priority: 10,
    });
  }
}
