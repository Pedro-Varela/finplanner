const NOISE_TOKENS = new Set([
  "PIX",
  "TED",
  "DOC",
  "COMPRA",
  "DEB",
  "CRED",
  "DEBITO",
  "CREDITO",
  "PAGAMENTO",
  "PAG",
  "PGTO",
  "TRANSF",
  "TRANSFERENCIA",
  "RECEBIMENTO",
  "ENVIO",
  "CARTAO",
  "VISA",
  "MASTERCARD",
  "ELO",
  "INTERNACIONAL",
  "NACIONAL",
  "PARCELA",
  "DE",
  "DO",
  "DA",
  "PARA",
  "EM",
  "NO",
  "NA",
  "COM",
  "SEM",
  "POR",
]);

const ACCENT_MAP: Record<string, string> = {
  "\u00E0": "A",
  "\u00E1": "A",
  "\u00E2": "A",
  "\u00E3": "A",
  "\u00E4": "A",
  "\u00E8": "E",
  "\u00E9": "E",
  "\u00EA": "E",
  "\u00EB": "E",
  "\u00EC": "I",
  "\u00ED": "I",
  "\u00EE": "I",
  "\u00EF": "I",
  "\u00F2": "O",
  "\u00F3": "O",
  "\u00F4": "O",
  "\u00F5": "O",
  "\u00F6": "O",
  "\u00F9": "U",
  "\u00FA": "U",
  "\u00FB": "U",
  "\u00FC": "U",
  "\u00E7": "C",
  "\u00F1": "N",
};

function removeAccents(str: string): string {
  return str.replace(/[àáâãäèéêëìíîïòóôõöùúûüçñ]/gi, (ch) => ACCENT_MAP[ch.toLowerCase()] ?? ch);
}

/**
 * Normaliza uma descrição bancária para matching de regras:
 * uppercase → remove acentos → remove pontuação → remove tokens comuns → colapsa espaços
 */
export function normalizeDescription(raw: string): string {
  let result = raw.toUpperCase();
  result = removeAccents(result);
  result = result.replace(/[^A-Z0-9\s]/g, " ");
  result = result.replace(/\s+/g, " ").trim();

  const tokens = result.split(" ").filter((t) => !NOISE_TOKENS.has(t) && t.length > 0);

  return tokens.join(" ");
}
