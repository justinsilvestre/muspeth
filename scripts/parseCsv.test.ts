import { describe, expect, it } from "vitest";
import { parseCsv, readCsvRecords } from "./parseCsv.ts";

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

describe("readCsvRecords", () => {
  async function* toAsync(lines: string[]) {
    yield* lines;
  }

  async function readAll(lines: string[]) {
    const records: Record<string, string>[] = [];
    for await (const record of readCsvRecords(toAsync(lines))) records.push(record);
    return records;
  }

  it("keys each row's fields by the header's column names, without a byte order mark", async () => {
    expect(await readAll(["﻿ID,Form", "1,pine"])).toEqual([{ ID: "1", Form: "pine" }]);
  });

  it("joins a quoted field that spans lines", async () => {
    expect(await readAll(["ID,MOTIF", '1,"Bee, ant', 'and pine"', "2,x"])).toEqual([
      { ID: "1", MOTIF: "Bee, ant\nand pine" },
      { ID: "2", MOTIF: "x" },
    ]);
  });

  it("reads doubled quotes as one quote", async () => {
    const [record] = await readAll(["ID,MOTIF", '1,"The ""Fir Bolg"""']);
    expect(record?.MOTIF).toBe('The "Fir Bolg"');
  });

  it("skips blank lines", async () => {
    expect(await readAll(["ID", "1", "", "2"])).toHaveLength(2);
  });
});
