import { describe, expect, it } from "vitest";
import { parseTsv } from "./parseTsv.ts";

describe("parseTsv", () => {
  it("reads each row as a record keyed by the header", () => {
    expect(parseTsv("name\tmass\nStruthio camelus\t111000\n")).toEqual([
      { name: "Struthio camelus", mass: "111000" },
    ]);
  });

  it("reads Windows line endings", () => {
    expect(parseTsv("name\tmass\r\nRhea americana\t23000\r\n")).toEqual([
      { name: "Rhea americana", mass: "23000" },
    ]);
  });

  it("keeps line breaks inside quoted fields", () => {
    expect(parseTsv('name\tsource\nVireo bellii\t"Ref_46\nRef_47"\n')[0]?.source).toBe(
      "Ref_46\nRef_47",
    );
  });

  it("reads doubled quotes inside a quoted field as one quote", () => {
    expect(parseTsv('name\tnote\nA\t"a ""b"""\n')[0]?.note).toBe('a "b"');
  });

  it("gives missing trailing fields as empty strings", () => {
    expect(parseTsv("name\tmass\nA\n")[0]?.mass).toBe("");
  });
});
