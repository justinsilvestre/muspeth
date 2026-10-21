import { allOf, type SqlCondition } from "./sqlCondition";

/**
 * The start and end of a connection's date.
 * Each is the whole date when the date is not an interval.
 */
export const dateStartSql =
  "CASE WHEN instr(date, '/') > 0 THEN substr(date, 1, instr(date, '/') - 1) ELSE date END";
const dateEndSql =
  "CASE WHEN instr(date, '/') > 0 THEN substr(date, instr(date, '/') + 1) ELSE date END";

/**
 * Keeps connections whose date overlaps the period. A connection's date is an ISO 8601 date,
 * or an interval such as "1990/1992", whose ends may be open ("1990/..") or empty ("/1992").
 * Years are compared as numbers, so that years before the common era, such as "-0500", come
 * before later ones.
 * Within one year, comparing text works for dates of different precision because "~" sorts after
 * every digit: a date such as "1990" ends at "1990~", after every day in 1990.
 */
export function periodSql(from: string | null, to: string | null) {
  return allOf([
    { sql: "date IS NOT NULL AND date <> ''", bindings: [] },
    to ? startsByEndOfSql(to) : null,
    from ? endsByStartOfSql(from) : null,
  ]);
}

function startsByEndOfSql(to: string) {
  const year = toYearSql(dateStartSql);
  const toYear = Number.parseInt(to, 10);
  return {
    sql: `${year} IS NULL OR ${year} < ? OR (${year} = ? AND (${dateStartSql}) <= ?)`,
    bindings: [toYear, toYear, `${to}~`],
  } satisfies SqlCondition;
}

function endsByStartOfSql(from: string) {
  const year = toYearSql(dateEndSql);
  const fromYear = Number.parseInt(from, 10);
  return {
    sql: `${year} IS NULL OR ${year} > ? OR (${year} = ? AND (${dateEndSql}) || '~' >= ?)`,
    bindings: [fromYear, fromYear, from],
  } satisfies SqlCondition;
}

/** Reads the year of a date as a number, or null for an open or empty end of an interval. */
export function toYearSql(dateSql: string) {
  return `(CASE WHEN (${dateSql}) IN ('', '..') THEN NULL ELSE CAST((${dateSql}) AS INTEGER) END)`;
}
