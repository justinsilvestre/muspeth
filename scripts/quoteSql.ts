/** Writes a value as an SQLite literal, escaping single quotes. */
export function quoteSql(value: string | number | null) {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}
