import { deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { readZipEntries, writeZipEntries } from "./zipArchive.ts";

const entries = new Map([
  ["a.txt", Buffer.from("first")],
  ["dir/b.txt", Buffer.from("second")],
]);

describe("readZipEntries", () => {
  it("reads the files of an archive by name", () => {
    const read = readZipEntries(writeZipEntries(entries));
    expect([...read].map(([name, data]) => [name, data.toString()])).toEqual([
      ["a.txt", "first"],
      ["dir/b.txt", "second"],
    ]);
  });

  it("inflates a deflated file", () => {
    const archive = writeZipEntries(new Map([["a.txt", deflateRawSync("compressed text")]]));
    archive.writeUInt16LE(8, 8);
    archive.writeUInt16LE(8, archive.readUInt32LE(archive.length - 6) + 10);
    expect(readZipEntries(archive).get("a.txt")?.toString()).toBe("compressed text");
  });

  it("rejects data that is not an archive", () => {
    expect(() => readZipEntries(Buffer.from("not a zip file at all"))).toThrow();
  });
});
