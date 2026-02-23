import { describe, it, expect } from "vitest";
import { parseAmountPtBr } from "../parse-amount-ptbr";

describe("parseAmountPtBr", () => {
  it("converte valor com milhar e decimal", () => {
    expect(parseAmountPtBr("1.234,56")).toBe(1234.56);
  });

  it("converte negativo simples", () => {
    expect(parseAmountPtBr("-89,90")).toBe(-89.9);
  });

  it("converte sem decimal", () => {
    expect(parseAmountPtBr("1234")).toBe(1234);
  });

  it("converte decimal sem milhar", () => {
    expect(parseAmountPtBr("0,50")).toBe(0.5);
  });

  it("converte negativo com milhar", () => {
    expect(parseAmountPtBr("-1.000")).toBe(-1000);
  });

  it("converte milhar grande com decimal", () => {
    expect(parseAmountPtBr("12.345.678,99")).toBe(12345678.99);
  });

  it("retorna NaN para string vazia", () => {
    expect(parseAmountPtBr("")).toBeNaN();
  });

  it("lida com espaços em volta", () => {
    expect(parseAmountPtBr("  1.500,00  ")).toBe(1500);
  });
});
