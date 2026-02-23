import { describe, it, expect } from "vitest";
import { applyRules, type RuleInput } from "../apply-rules";

const rules: RuleInput[] = [
  { pattern: "NETFLIX", matchType: "equals", categoryId: "cat-entertainment", priority: 10 },
  { pattern: "UBER", matchType: "contains", categoryId: "cat-transport", priority: 20 },
  { pattern: "^IFOOD", matchType: "regex", categoryId: "cat-food", priority: 30 },
  { pattern: "SPOTIFY", matchType: "equals", categoryId: null, priority: 5 },
];

describe("applyRules", () => {
  it("match exato (equals)", () => {
    expect(applyRules("NETFLIX", rules)).toBe("cat-entertainment");
  });

  it("não faz match exato parcial", () => {
    expect(applyRules("NETFLIX PREMIUM", rules)).not.toBe("cat-entertainment");
  });

  it("match por substring (contains)", () => {
    expect(applyRules("UBER TRIP 123", rules)).toBe("cat-transport");
  });

  it("match por regex", () => {
    expect(applyRules("IFOOD RESTAURANTE", rules)).toBe("cat-food");
  });

  it("retorna null quando nenhuma regra faz match", () => {
    expect(applyRules("AMAZON", rules)).toBeNull();
  });

  it("retorna null quando categoryId é null na regra", () => {
    expect(applyRules("SPOTIFY", rules)).toBeNull();
  });

  it("retorna null para merchant vazio", () => {
    expect(applyRules("", rules)).toBeNull();
  });

  it("retorna null para rules vazias", () => {
    expect(applyRules("NETFLIX", [])).toBeNull();
  });

  it("respeita prioridade (menor = mais prioritário)", () => {
    const overlapping: RuleInput[] = [
      { pattern: "TEST", matchType: "contains", categoryId: "low-priority", priority: 100 },
      { pattern: "TEST", matchType: "contains", categoryId: "high-priority", priority: 1 },
    ];
    expect(applyRules("TEST MERCHANT", overlapping)).toBe("high-priority");
  });
});
