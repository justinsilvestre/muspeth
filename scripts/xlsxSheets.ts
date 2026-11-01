import { readZipEntries } from "./zipArchive.ts";

/**
 * Reads the sheets of an Excel workbook as rows of cell texts, by sheet name.
 * Each row is an array indexed by column, from A, with empty strings for missing cells.
 * Formulas are read by their cached values, and dates and numbers as the text stored for them.
 */
export function readXlsxSheets(workbook: Buffer) {
  const files = readZipEntries(workbook);
  const text = (name: string) => files.get(name)?.toString("utf8") ?? "";
  const sharedStrings = listSharedStrings(text("xl/sharedStrings.xml"));
  const targetsById = new Map(
    listElements(text("xl/_rels/workbook.xml.rels"), "Relationship").map((attributes) => [
      readAttribute(attributes, "Id"),
      readAttribute(attributes, "Target"),
    ]),
  );
  const sheets = new Map<string, string[][]>();
  for (const attributes of listElements(text("xl/workbook.xml"), "sheet")) {
    const target = targetsById.get(readAttribute(attributes, "r:id")) ?? "";
    const path = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
    sheets.set(decodeXml(readAttribute(attributes, "name")), readRows(text(path), sharedStrings));
  }
  return sheets;
}

/** Lists the attribute text of each element of the given name. */
function listElements(xml: string, element: string) {
  const pattern = new RegExp(`<${element}\\b([^>]*?)/?>`, "g");
  return [...xml.matchAll(pattern)].map((match) => match[1] ?? "");
}

function listSharedStrings(xml: string) {
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) => readTexts(match[1] ?? ""));
}

function readRows(xml: string, sharedStrings: string[]) {
  return [...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].map((rowMatch) => {
    const cells: string[] = [];
    const cellPattern = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    for (const match of (rowMatch[1] ?? "").matchAll(cellPattern)) {
      const attributes = match[1] ?? "";
      const column = toColumnIndex(readAttribute(attributes, "r"));
      while (cells.length < column) cells.push("");
      cells[column] = readCell(readAttribute(attributes, "t"), match[2] ?? "", sharedStrings);
    }
    return cells;
  });
}

function readCell(type: string, body: string, sharedStrings: string[]) {
  if (type === "s") return sharedStrings[Number(readTexts(body, "v"))] ?? "";
  if (type === "inlineStr") return readTexts(body);
  return readTexts(body, "v");
}

/** Joins the texts of the given element, or of every text run, decoding XML entities. */
function readTexts(xml: string, element = "t") {
  const pattern = new RegExp(`<${element}\\b[^>]*>([\\s\\S]*?)</${element}>`, "g");
  return [...xml.matchAll(pattern)].map((match) => decodeXml(match[1] ?? "")).join("");
}

function readAttribute(attributes: string, name: string) {
  return attributes.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "";
}

/** Converts a cell reference such as "C7" to its zero-based column index. */
function toColumnIndex(reference: string) {
  const letters = reference.match(/^[A-Z]+/)?.[0] ?? "A";
  return [...letters].reduce((index, letter) => index * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function decodeXml(text: string) {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}
