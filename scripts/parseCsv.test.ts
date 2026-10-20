import { describe, expect, it } from "vitest";
import { parseCsv } from "./parseCsv.ts";

describe("parseCsv", () => {
  it("keys each row's fields by the header's column names", () => {
    expect(parseCsv("ID,Form\n1,pine\n")).toEqual([{ ID: "1", Form: "pine" }]);
  });

  it("keeps commas and line breaks inside quoted fields", () => {
    expect(parseCsv('ID,MOTIF\n1,"Bee, ant\nand pine"')).toEqual([
      { ID: "1", MOTIF: "Bee, ant\nand pine" },
    ]);
  });

  it("reads doubled quotes inside quoted fields as one quote", () => {
    expect(parseCsv('ID,MOTIF\n1,"The ""Fir Bolg"""')[0]?.MOTIF).toBe('The "Fir Bolg"');
  });

  it("reads Windows line endings", () => {
    expect(parseCsv("ID,Form\r\n1,pine\r\n")).toEqual([{ ID: "1", Form: "pine" }]);
  });

  it("gives missing trailing fields as empty strings", () => {
    expect(parseCsv("ID,Form\n1")).toEqual([{ ID: "1", Form: "" }]);
  });

  it("skips blank lines", () => {
    expect(parseCsv("ID\n1\n\n2\n")).toHaveLength(2);
  });
});
