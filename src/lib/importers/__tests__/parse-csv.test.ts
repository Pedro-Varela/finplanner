import { describe, it, expect } from "vitest";
import { detectSeparator, parseCsv } from "../parse-csv";

describe("detectSeparator", () => {
  it("detecta vírgula quando há mais vírgulas", () => {
    expect(detectSeparator("date,description,amount")).toBe(",");
  });

  it("detecta ponto-e-vírgula quando há mais", () => {
    expect(detectSeparator("data;descricao;valor")).toBe(";");
  });

  it("retorna vírgula como fallback quando são iguais", () => {
    expect(detectSeparator("abc")).toBe(",");
  });
});

describe("parseCsv", () => {
  it("faz parse de CSV simples com vírgula", () => {
    const csv = "a,b,c\n1,2,3\n4,5,6";
    const result = parseCsv(csv);
    expect(result).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
      ["4", "5", "6"],
    ]);
  });

  it("faz parse com ponto-e-vírgula", () => {
    const csv = "a;b;c\n1;2;3";
    const result = parseCsv(csv, ";");
    expect(result).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("lida com campos entre aspas", () => {
    const csv = 'a,"b,c",d\n1,"hello ""world""",3';
    const result = parseCsv(csv);
    expect(result[0]).toEqual(["a", "b,c", "d"]);
    expect(result[1]).toEqual(["1", 'hello "world"', "3"]);
  });

  it("lida com quebra de linha dentro de aspas", () => {
    const csv = 'a,b\n"line1\nline2",val';
    const result = parseCsv(csv);
    expect(result[1][0]).toBe("line1\nline2");
  });

  it("ignora linhas vazias", () => {
    const csv = "a,b\n\n1,2\n\n";
    const result = parseCsv(csv);
    expect(result).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});
