/**
 * Converte string de valor monetário em formato PT-BR para number.
 *
 * Exemplos:
 *   "1.234,56"  →  1234.56
 *   "-89,90"    → -89.90
 *   "1234"      →  1234
 *   "0,50"      →  0.50
 *   "-1.000"    → -1000
 */
export function parseAmountPtBr(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return NaN;

  const hasComma = trimmed.includes(",");
  const hasDot = trimmed.includes(".");

  let normalized: string;

  if (hasComma && hasDot) {
    // "1.234,56" → remove dots (thousands), replace comma (decimal)
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    // "89,90" → replace comma with dot
    normalized = trimmed.replace(",", ".");
  } else {
    // "1234" or "1.234" (ambiguous — but if dot is thousands separator with no decimals)
    // Heuristic: if there's a single dot and exactly 3 digits after it, it's a thousands separator
    const dotMatch = trimmed.match(/^-?\d+\.(\d+)$/);
    if (dotMatch && dotMatch[1].length === 3) {
      normalized = trimmed.replace(".", "");
    } else {
      normalized = trimmed;
    }
  }

  return parseFloat(normalized);
}
