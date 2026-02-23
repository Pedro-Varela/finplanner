import { describe, it, expect } from "vitest";
import { parseDate } from "../parse-date";

describe("parseDate", () => {
  it("converte dd/mm/aaaa para ISO", () => {
    expect(parseDate("15/03/2025")).toBe("2025-03-15");
  });

  it("mantém formato ISO inalterado", () => {
    expect(parseDate("2025-01-20")).toBe("2025-01-20");
  });

  it("retorna null para formato inválido", () => {
    expect(parseDate("03-15-2025")).toBeNull();
  });

  it("retorna null para data inexistente", () => {
    expect(parseDate("31/02/2025")).toBeNull();
  });

  it("retorna null para string vazia", () => {
    expect(parseDate("")).toBeNull();
  });

  it("aceita espaços", () => {
    expect(parseDate("  01/12/2024  ")).toBe("2024-12-01");
  });

  it("rejeita mês 13", () => {
    expect(parseDate("01/13/2025")).toBeNull();
  });

  it("aceita dia 1 dígito dentro do padrão dd", () => {
    expect(parseDate("01/01/2025")).toBe("2025-01-01");
  });
});
