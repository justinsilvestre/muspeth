import type { PlacedConnection } from "../../shared/placeAndPeriodQuery";
import { KindBar } from "../graphics/KindBar";
import { termLabel } from "../termLabel";
import {
  chooseTimelineDomain,
  packTimelineLanes,
  projectYear,
  type YearSpan,
} from "./layoutTimeline";
import { parseDateSpan } from "./parseDateSpan";

const width = 400;
const laneHeight = 10;
const maxLanes = 8;
/** The least space, in pixels, between two spans that share a lane. */
const gapPixels = 8;

type DatedSpan = YearSpan & Pick<PlacedConnection, "kind"> & { date: string };

type PeriodTimelineProps = {
  from: string | null;
  to: string | null;
  connections: PlacedConnection[];
};

/** Draws the searched period and when each connection was recorded, as a dot for a day or a bar for a longer span. */
export function PeriodTimeline({ from, to, connections }: PeriodTimelineProps) {
  const dated = listDatedSpans(connections);
  const [fromSpan, toSpan] = [from && parseDateSpan(from), to && parseDateSpan(to)];
  const domain = chooseTimelineDomain([...dated, ...[fromSpan, toSpan].filter((span) => !!span)]);
  const xOf = (year: number) => projectYear(domain, year, width);
  const lanes = packTimelineLanes(dated, (gapPixels / width) * (domain.end - domain.start));
  const laneCount = Math.min(Math.max(0, ...lanes) + 1, maxLanes);
  const axisY = 26 + laneCount * laneHeight;
  const band =
    fromSpan || toSpan
      ? { start: fromSpan ? fromSpan.start : domain.start, end: toSpan ? toSpan.end : domain.end }
      : null;
  const edges = band
    ? { start: { x: xOf(band.start), text: from ?? "" }, end: { x: xOf(band.end), text: to ?? "" } }
    : listDataEdges(dated, xOf);
  return (
    <svg
      role="img"
      aria-labelledby="period-timeline-title period-timeline-desc"
      viewBox={`0 0 ${width} ${axisY + 18}`}
      className="h-auto w-full max-w-sm text-[11px]"
    >
      <title id="period-timeline-title">Timeline of when the connections were recorded</title>
      <desc id="period-timeline-desc">{describeTimeline(dated.length, from, to)}</desc>
      {(fromSpan || toSpan) && (
        <g>
          <rect
            x={xOf(fromSpan ? fromSpan.start : domain.start)}
            width={
              xOf(toSpan ? toSpan.end : domain.end) - xOf(fromSpan ? fromSpan.start : domain.start)
            }
            y={4}
            height={axisY - 4}
            className="fill-subtle"
          />
          <text x={xOf(fromSpan ? fromSpan.start : domain.start) + 4} y={15} className="fill-muted">
            searched period
          </text>
        </g>
      )}
      {dated.map((span, index) => {
        const y = 26 + Math.min(lanes[index] ?? 0, maxLanes - 1) * laneHeight;
        return (
          <KindBar
            key={`${span.date} ${span.kind}`}
            from={{ x: xOf(span.start), y }}
            to={{ x: xOf(span.end), y }}
            kind={span.kind}
          >
            <title>{`${span.date}: ${termLabel(span.kind)}`}</title>
          </KindBar>
        );
      })}
      <line x1={0} x2={width} y1={axisY} y2={axisY} className="stroke-faint" />
      <text x={edges.start.x} y={axisY + 14} className="fill-muted">
        {edges.start.text}
      </text>
      {edges.end.text !== edges.start.text && (
        <text x={edges.end.x} y={axisY + 14} textAnchor="end" className="fill-muted">
          {edges.end.text}
        </text>
      )}
    </svg>
  );
}

/** Labels the axis with the earliest and the latest dates recorded, at the start of the one and the end of the other. */
function listDataEdges(dated: DatedSpan[], xOf: (year: number) => number) {
  const first = dated.reduce((earliest, span) => (span.start < earliest.start ? span : earliest));
  const last = dated.reduce((latest, span) => (span.end > latest.end ? span : latest));
  return {
    start: { x: xOf(first.start), text: first.date },
    end: { x: xOf(last.end), text: last.date },
  };
}

/** Lists each distinct date and kind of connection once, as a span of years. */
function listDatedSpans(connections: PlacedConnection[]) {
  const spans = new Map<string, DatedSpan>();
  for (const { date, kind } of connections) {
    const span = date && parseDateSpan(date);
    if (span) spans.set(`${date} ${kind}`, { ...span, date, kind });
  }
  return [...spans.values()];
}

function describeTimeline(count: number, from: string | null, to: string | null) {
  const period = from || to ? `, within the period ${from ?? "…"} to ${to ?? "…"}` : "";
  return `${count} distinct ${count === 1 ? "date" : "dates"} of recording${period}.`;
}
