/**
 * Reads comma-separated text with a header row into one record per row, keyed by column name.
 * Fields may be quoted, and quoted fields may hold commas, line breaks and doubled quotes.
 */
export function parseCsv(text: string) {
  const [header = [], ...rows] = splitRows(text);
  return rows.filter(hasContent).map((row) => toRecord(header, row));
}

/**
 * Reads comma-separated text line by line, as from a large file, giving one record per row keyed
 * by the header's column names. Quoted fields may span lines.
 */
export async function* readCsvRecords(lines: AsyncIterable<string>) {
  let header: string[] | null = null;
  let pending = "";
  let isInsideQuotes = false;
  for await (const line of lines) {
    pending = isInsideQuotes ? `${pending}\n${line}` : line;
    if (countQuotes(line) % 2 === 1) isInsideQuotes = !isInsideQuotes;
    if (isInsideQuotes) continue;
    const [row = []] = splitRows(pending);
    if (!header) header = row.map((column) => column.replace(/^﻿/, ""));
    else if (hasContent(row)) yield toRecord(header, row);
  }
}

function countQuotes(line: string) {
  let count = 0;
  for (let index = line.indexOf('"'); index !== -1; index = line.indexOf('"', index + 1)) count++;
  return count;
}

function hasContent(row: string[]) {
  return row.some((field) => field !== "");
}

function toRecord(header: string[], row: string[]) {
  return Object.fromEntries(header.map((column, index) => [column, row[index] ?? ""]));
}

function splitRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let isQuoted = false;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (isQuoted && character === '"' && text[index + 1] === '"') {
      field += '"';
      index++;
    } else if (character === '"') {
      isQuoted = !isQuoted;
    } else if (!isQuoted && character === ",") {
      row.push(field);
      field = "";
    } else if (!isQuoted && character === "\n") {
      rows.push([...row, field]);
      row = [];
      field = "";
    } else if (isQuoted || character !== "\r") {
      field += character;
    }
  }
  if (field !== "" || row.length > 0) rows.push([...row, field]);
  return rows;
}
