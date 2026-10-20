/**
 * Reads tab-separated text into one record per row, keyed by the first row's column names.
 * Fields may be quoted, in which case they may hold tabs, line breaks and doubled quotes.
 */
export function parseTsv(text: string) {
  const [header = [], ...rows] = splitRows(text);
  return rows.map((row) => Object.fromEntries(header.map((column, i) => [column, row[i] ?? ""])));
}

function splitRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let isQuoted = false;
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (isQuoted) {
      if (character === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (character === '"') isQuoted = false;
      else field += character;
    } else if (character === '"' && field === "") isQuoted = true;
    else if (character === "\t") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      rows.push([...row, field.replace(/\r$/, "")]);
      row = [];
      field = "";
    } else field += character;
  }
  if (field !== "" || row.length > 0) rows.push([...row, field.replace(/\r$/, "")]);
  return rows;
}
