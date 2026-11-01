const datePattern = /^(-?\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;
const daysPerYear = 365.25;

/**
 * Reads an ISO 8601 date of a year, month or day, or an interval of two such dates like "1990/1992", as a span of decimal years.
 * A date stands for the whole year, month or day it names. Returns null for text it cannot read.
 */
export function parseDateSpan(text: string) {
  const [first = "", last = first] = text.split("/");
  const [start, end] = [readDate(first), readDate(last)];
  if (!start || !end) return null;
  return { start: start.start, end: end.end };
}

function readDate(text: string) {
  const match = datePattern.exec(text);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  if (year === undefined) return null;
  if (!month) return { start: year, end: year + 1 };
  const monthStart = year + (month - 1) / 12;
  if (!day) return { start: monthStart, end: monthStart + 1 / 12 };
  const dayStart = monthStart + (day - 1) / daysPerYear;
  return { start: dayStart, end: dayStart + 1 / daysPerYear };
}
