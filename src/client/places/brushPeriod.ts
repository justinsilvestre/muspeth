/** Brushed stretches at least this many years long are rounded to whole years, and shorter ones to whole months. */
const minYearsForWholeYears = 2;

/**
 * Turns a stretch of a timeline, between two decimal years in either order, into a period to search,
 * rounded outwards to the whole years or months it touches.
 */
export function brushPeriod(oneEnd: number, otherEnd: number) {
  const [start, end] = [Math.min(oneEnd, otherEnd), Math.max(oneEnd, otherEnd)];
  if (end - start >= minYearsForWholeYears) {
    return { from: formatYear(Math.floor(start)), to: formatYear(Math.ceil(end) - 1) };
  }
  const startMonth = Math.floor(start * 12);
  const endMonth = Math.max(startMonth, Math.ceil(end * 12) - 1);
  return { from: formatMonth(startMonth), to: formatMonth(endMonth) };
}

/** Writes a year as ISO 8601 does, with four digits and a minus sign before the common era. */
function formatYear(year: number) {
  const digits = String(Math.abs(year)).padStart(4, "0");
  return year < 0 ? `-${digits}` : digits;
}

/** Writes a month, counted from the start of year 0, as an ISO 8601 date such as "1990-04". */
function formatMonth(month: number) {
  const year = Math.floor(month / 12);
  return `${formatYear(year)}-${String(month - year * 12 + 1).padStart(2, "0")}`;
}
