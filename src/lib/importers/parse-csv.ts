/**
 * Detecta o separador do CSV analisando a primeira linha.
 * Conta ocorrências de ',' vs ';'. O mais frequente ganha.
 */
export function detectSeparator(firstLine: string): "," | ";" {
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

/**
 * Faz parse de uma string CSV completa em array de arrays de strings.
 * Lida com campos entre aspas e quebras de linha dentro de campos.
 */
export function parseCsv(content: string, separator?: "," | ";"): string[][] {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const firstLine = lines.split("\n")[0] ?? "";
  const sep = separator ?? detectSeparator(firstLine);

  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < lines.length; i++) {
    const ch = lines[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < lines.length && lines[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === sep) {
        current.push(field.trim());
        field = "";
      } else if (ch === "\n") {
        current.push(field.trim());
        if (current.some((c) => c.length > 0)) {
          rows.push(current);
        }
        current = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }

  current.push(field.trim());
  if (current.some((c) => c.length > 0)) {
    rows.push(current);
  }

  return rows;
}
