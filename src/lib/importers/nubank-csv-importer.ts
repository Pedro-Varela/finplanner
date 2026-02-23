import { parseCsv } from "./parse-csv";
import { parseAmountPtBr } from "./parse-amount-ptbr";
import { parseDate } from "./parse-date";

export interface ImportedRow {
  date: string;
  description: string;
  amount: number;
}

export interface ColumnMapping {
  dateIndex: number;
  descriptionIndex: number;
  amountIndex: number;
}

const DATE_KEYWORDS = ["date", "data", "dt", "vencimento"];
const DESC_KEYWORDS = [
  "description",
  "descrição",
  "descricao",
  "título",
  "titulo",
  "title",
  "merchant",
  "estabelecimento",
];
const AMOUNT_KEYWORDS = ["amount", "valor", "value", "quantia", "vl"];

function matchColumn(header: string, keywords: string[]): boolean {
  const lower = header.toLowerCase().trim();
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Detecta o mapeamento de colunas por heurística no header.
 * Retorna null se não conseguir identificar todas as 3 colunas.
 */
export function detectColumns(headers: string[]): ColumnMapping | null {
  let dateIndex = -1;
  let descriptionIndex = -1;
  let amountIndex = -1;

  for (let i = 0; i < headers.length; i++) {
    if (dateIndex === -1 && matchColumn(headers[i], DATE_KEYWORDS)) dateIndex = i;
    else if (amountIndex === -1 && matchColumn(headers[i], AMOUNT_KEYWORDS)) amountIndex = i;
    else if (descriptionIndex === -1 && matchColumn(headers[i], DESC_KEYWORDS))
      descriptionIndex = i;
  }

  // Fallback: se sobrou exatamente 1 coluna não mapeada, é a description
  if (descriptionIndex === -1) {
    const mapped = new Set([dateIndex, amountIndex]);
    const remaining = headers.map((_, i) => i).filter((i) => !mapped.has(i));
    if (remaining.length === 1) descriptionIndex = remaining[0];
  }

  if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) return null;

  return { dateIndex, descriptionIndex, amountIndex };
}

export interface ImportOptions {
  columnMapping?: ColumnMapping;
}

/**
 * Importa CSV de extrato bancário (Nubank e similares).
 * Detecta colunas automaticamente ou aceita mapping manual.
 * Retorna lista de rows normalizadas + lista de erros por linha.
 */
export function importNubankCsv(
  csvContent: string,
  options?: ImportOptions
): { rows: ImportedRow[]; errors: { line: number; reason: string }[] } {
  const parsed = parseCsv(csvContent);
  if (parsed.length < 2) {
    return { rows: [], errors: [{ line: 1, reason: "CSV vazio ou sem dados." }] };
  }

  const [headerRow, ...dataRows] = parsed;

  const mapping = options?.columnMapping ?? detectColumns(headerRow);
  if (!mapping) {
    return {
      rows: [],
      errors: [
        {
          line: 1,
          reason: `Não foi possível identificar as colunas. Headers encontrados: ${headerRow.join(", ")}`,
        },
      ],
    };
  }

  const rows: ImportedRow[] = [];
  const errors: { line: number; reason: string }[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const lineNum = i + 2;

    const rawDate = row[mapping.dateIndex] ?? "";
    const rawDesc = row[mapping.descriptionIndex] ?? "";
    const rawAmount = row[mapping.amountIndex] ?? "";

    const date = parseDate(rawDate);
    if (!date) {
      errors.push({ line: lineNum, reason: `Data inválida: "${rawDate}"` });
      continue;
    }

    const amount = parseAmountPtBr(rawAmount);
    if (isNaN(amount)) {
      errors.push({ line: lineNum, reason: `Valor inválido: "${rawAmount}"` });
      continue;
    }

    const description = rawDesc.trim();
    if (!description) {
      errors.push({ line: lineNum, reason: "Descrição vazia." });
      continue;
    }

    rows.push({ date, description, amount: Math.abs(amount) });
  }

  return { rows, errors };
}
