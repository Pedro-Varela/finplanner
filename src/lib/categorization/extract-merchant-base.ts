import { normalizeDescription } from "./normalize-description";

/**
 * Extrai o nome base do comerciante de uma descrição bancária.
 *
 * Separa no raw ANTES de normalizar, para preservar delimitadores como * e -.
 */
export function extractMerchantBase(rawDescription: string): string {
  if (!rawDescription.trim()) return "";

  // Separadores comuns em extratos: *, -, /
  const separators = /\s*[\*\/]\s*|\s+\-\s+/;
  const parts = rawDescription.split(separators).filter(Boolean);

  let candidate = parts[0]?.trim() ?? "";

  // Se a parte antes do separador é muito curta (ex: "PAG"), pega a próxima
  if (candidate.length <= 3 && parts.length > 1) {
    candidate = parts[1].trim();
  }

  const normalized = normalizeDescription(candidate);

  // Remove tokens puramente numéricos (códigos de transação)
  const cleaned = normalized
    .split(" ")
    .filter((t) => !/^\d+$/.test(t))
    .join(" ")
    .trim();

  return cleaned || normalizeDescription(rawDescription);
}
