import { describe, it, expect } from "vitest";
import { extractMerchantBase } from "../extract-merchant-base";

describe("extractMerchantBase", () => {
  it("extrai antes do *", () => {
    expect(extractMerchantBase("IFOOD *ABC123")).toBe("IFOOD");
  });

  it("extrai UBER de UBER *TRIP", () => {
    expect(extractMerchantBase("UBER *TRIP-XYZ")).toBe("UBER");
  });

  it("pega segunda parte se primeira é curta (PAG*)", () => {
    expect(extractMerchantBase("PAG*JoseDaSilva")).toBe("JOSEDASILVA");
  });

  it("remove números soltos (códigos)", () => {
    expect(extractMerchantBase("MERCADOLIVRE 12345")).toBe("MERCADOLIVRE");
  });

  it("normaliza descrição PIX", () => {
    const result = extractMerchantBase("Pix - João da Silva");
    expect(result).toBe("JOAO SILVA");
  });

  it("retorna string vazia para input vazio", () => {
    expect(extractMerchantBase("")).toBe("");
  });

  it("mantém fallback para texto simples", () => {
    expect(extractMerchantBase("Supermercado Extra")).toBe("SUPERMERCADO EXTRA");
  });
});
