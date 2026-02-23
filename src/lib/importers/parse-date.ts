const DD_MM_YYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const YYYY_MM_DD = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Aceita "dd/mm/aaaa" ou "aaaa-mm-dd" e retorna ISO "yyyy-mm-dd".
 * Retorna null se o formato for inválido ou a data não existir.
 */
export function parseDate(raw: string): string | null {
  const trimmed = raw.trim();

  let year: number, month: number, day: number;

  const brMatch = trimmed.match(DD_MM_YYYY);
  if (brMatch) {
    day = parseInt(brMatch[1], 10);
    month = parseInt(brMatch[2], 10);
    year = parseInt(brMatch[3], 10);
  } else {
    const isoMatch = trimmed.match(YYYY_MM_DD);
    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10);
      day = parseInt(isoMatch[3], 10);
    } else {
      return null;
    }
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}
