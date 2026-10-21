/** A stretch of time in decimal years, such as 1990.5 for the start of July 1990. */
export type YearSpan = { start: number; end: number };

/** Chooses the stretch of time a timeline shows: every span, with a margin, and at least a year. */
export function chooseTimelineDomain(spans: YearSpan[]) {
  const start = Math.min(...spans.map((span) => span.start));
  const end = Math.max(...spans.map((span) => span.end));
  const margin = Math.max((end - start) * 0.05, (1 - (end - start)) / 2, 0.1);
  return { start: start - margin, end: end + margin } satisfies YearSpan;
}

/**
 * Assigns each span to a lane, so that spans in the same lane are at least `gap` years apart.
 * Returns the lanes in the order of the spans given.
 */
export function packTimelineLanes(spans: YearSpan[], gap: number) {
  const laneEnds: number[] = [];
  const lanes = new Array<number>(spans.length).fill(0);
  const order = spans.map((span, index) => ({ ...span, index })).sort((a, b) => a.start - b.start);
  for (const { start, end, index } of order) {
    const free = laneEnds.findIndex((laneEnd) => laneEnd + gap <= start);
    const lane = free === -1 ? laneEnds.length : free;
    laneEnds[lane] = end;
    lanes[index] = lane;
  }
  return lanes;
}

/** Places a year on a timeline of the given width. */
export function projectYear(domain: YearSpan, year: number, width: number) {
  return ((year - domain.start) / (domain.end - domain.start)) * width;
}
