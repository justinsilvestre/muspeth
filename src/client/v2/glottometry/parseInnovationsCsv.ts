/** One historical innovation, and the languages that underwent it. */
export type Innovation = { label: string; members: ReadonlySet<string> };

export type InnovationTable = { languages: string[]; innovations: Innovation[] };

/**
 * Parses a shared-innovations table in the format of the Historical Glottometry engine:
 * a header row naming the languages, then one row per innovation with 1 for each language that shares it.
 * A language marked NA (unknown) is treated as not sharing the innovation.
 */
export function parseInnovationsCsv(text: string) {
  const [header = [], ...rows] = splitRows(text);
  const languages = header.slice(1);
  const innovations = rows.map(([label = "", ...cells]) => ({
    label,
    members: new Set(languages.filter((_, index) => cells[index] === "1")),
  }));
  return { languages, innovations } satisfies InnovationTable;
}

/** Splits CSV text into rows of cells, accepting carriage-return, line-feed, or both as row separators. */
export function splitRows(text: string) {
  return text
    .split(/\r\n|\r|\n/)
    .filter((row) => row.trim() !== "")
    .map((row) => row.split(","));
}
