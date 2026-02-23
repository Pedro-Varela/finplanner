import { describe, it, expect } from "vitest";
import { normalizeDescription } from "../normalize-description";

describe("normalizeDescription", () => {
  it("uppercase + remove acentos", () => {
    expect(normalizeDescription("Café da manhã")).toBe("CAFE MANHA");
  });

  it("remove pontuação", () => {
    expect(normalizeDescription("IFOOD *abc-123")).toBe("IFOOD ABC 123");
  });

  it("remove tokens comuns de banco", () => {
    expect(normalizeDescription("PIX TRANSF João Silva")).toBe("JOAO SILVA");
  });

  it("colapsa múltiplos espaços", () => {
    expect(normalizeDescription("  muitos    espaços   ")).toBe("MUITOS ESPACOS");
  });

  it("remove COMPRA CARTAO etc", () => {
    expect(normalizeDescription("COMPRA CARTAO VISA NETFLIX")).toBe("NETFLIX");
  });

  it("lida com string vazia", () => {
    expect(normalizeDescription("")).toBe("");
  });
});
