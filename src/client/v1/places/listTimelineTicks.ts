import type { YearSpan } from "./layoutTimeline";

/** The spacings tried between ticks, in months, from coarsest to finest. */
const stepsMonths = [12_000, 6000, 2400, 1200, 600, 240, 120, 60, 24, 12, 6, 3, 1];
const minTickCount = 3;
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Lists the moments at which to mark a timeline, each as a decimal year with a label.
 * It uses the coarsest spacing that marks the timeline at least three times.
 */
export function listTimelineTicks(domain: YearSpan) {
  const step = stepsMonths.find((months) => listMonths(domain, months).length >= minTickCount) ?? 1;
  return listMonths(domain, step).map((month) => ({
    year: month / 12,
    label: labelMonth(month),
  }));
}

/** Lists the months within the span that are multiples of the step, counted from the start of year 0. */
function listMonths({ start, end }: YearSpan, step: number) {
  const months = [];
  for (let month = Math.ceil((start * 12) / step) * step; month <= end * 12; month += step) {
    months.push(month);
  }
  return months;
}

/** Names a month by its year when it is January, and by its name otherwise. */
function labelMonth(month: number) {
  const year = Math.floor(month / 12);
  const monthIndex = month - year * 12;
  if (monthIndex !== 0) return monthNames[monthIndex] ?? "";
  // ISO 8601 year 0 is 1 BCE.
  return year > 0 ? String(year) : `${1 - year} BCE`;
}
