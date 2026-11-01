import { describe, expect, it } from "vitest";
import { readXlsxSheets } from "./xlsxSheets.ts";
import { writeZipEntries } from "./zipArchive.ts";

const workbook = writeZipEntries(
  new Map([
    [
      "xl/workbook.xml",
      Buffer.from(
        '<workbook><sheets><sheet name="Genes &amp; more" sheetId="1" r:id="rId1"/><sheet name="Empty" sheetId="2" r:id="rId2"/></sheets></workbook>',
      ),
    ],
    [
      "xl/_rels/workbook.xml.rels",
      Buffer.from(
        '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Target="/xl/worksheets/sheet2.xml"/></Relationships>',
      ),
    ],
    [
      "xl/sharedStrings.xml",
      Buffer.from(
        "<sst><si><t>Species</t></si><si><r><t>Zea </t></r><r><t>mays</t></r></si></sst>",
      ),
    ],
    [
      "xl/worksheets/sheet1.xml",
      Buffer.from(
        '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1" t="inlineStr"><is><t>Donor</t></is></c></row><row r="2"><c r="A2" t="s"><v>1</v></c><c r="B2"><v>7</v></c><c r="C2" t="str"><v>Paniceae</v></c></row></sheetData></worksheet>',
      ),
    ],
    ["xl/worksheets/sheet2.xml", Buffer.from("<worksheet><sheetData/></worksheet>")],
  ]),
);

describe("readXlsxSheets", () => {
  it("reads each sheet's cells by column, with empty strings for missing cells", () => {
    expect(readXlsxSheets(workbook).get("Genes & more")).toEqual([
      ["Species", "", "Donor"],
      ["Zea mays", "7", "Paniceae"],
    ]);
  });

  it("reads a sheet whose target path starts at the root", () => {
    expect(readXlsxSheets(workbook).get("Empty")).toEqual([]);
  });
});
