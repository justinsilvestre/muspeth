/**
 * Reads comma-separated text with a header row into one record per row, keyed by column name.
 * Fields may be quoted, and quoted fields may hold commas, line breaks and doubled quotes.
 */
export function parseCsv(text: string) {
  const [header = [], ...rows] = splitRows(text);
  return rows
    .filter((row) => row.some((field) => field !== ""))
    .map((row) => Object.fromEntries(header.map((column, index) => [column, row[index] ?? ""])));
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
