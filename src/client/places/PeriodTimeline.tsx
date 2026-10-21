import type { DateSummary } from "../../shared/placeAndPeriodSummary";
import { KindBar } from "../graphics/KindBar";
import { termLabel } from "../termLabel";
import { useElementWidth } from "../useElementWidth";
import { brushPeriod } from "./brushPeriod";
import {
  chooseTimelineDomain,
  packTimelineLanes,
  projectYear,
  type YearSpan,
  zoomTimelineDomain,
} from "./layoutTimeline";
import { listTimelineTicks } from "./listTimelineTicks";
import { parseDateSpan } from "./parseDateSpan";
import { useTimelineBrush } from "./useTimelineBrush";

const laneHeight = 10;
const maxLanes = 8;
/** The least space, in pixels, between two spans that share a lane. */
const gapPixels = 8;

type DatedSpan = YearSpan & DateSummary;

type PeriodTimelineProps = {
  from: string | null;
  to: string | null;
  /** Every date to draw, which must include at least one that `parseDateSpan` can read. */
  dates: DateSummary[];
  onPick: (period: { from: string; to: string }) => void;
};

/**
 * Draws when connections were recorded, as a dot for a day or a bar for a longer span, with the searched period shaded.
 * Dragging across the timeline, or clicking it, searches the period chosen.
 */
export function PeriodTimeline({ from, to, dates, onPick }: PeriodTimelineProps) {
  const [svgRef, width] = useElementWidth<SVGSVGElement>(400);
  const allSpans = listDatedSpans(dates);
  const [fromSpan, toSpan] = [from ? parseDateSpan(from) : null, to ? parseDateSpan(to) : null];
  const whole = chooseTimelineDomain([...allSpans, fromSpan, toSpan].filter((span) => !!span));
  const searched = from || to ? spanPeriod(fromSpan?.start, toSpan?.end, whole) : null;
  const domain = searched ? zoomTimelineDomain(whole, searched) : whole;
  const spans = allSpans.filter(({ start, end }) => end >= domain.start && start <= domain.end);
  const { brushed, handlers } = useTimelineBrush(domain, (start, end) =>
    onPick(brushPeriod(start, end)),
  );
  const xOf = (year: number) => projectYear(domain, year, width);
  const lanes = packTimelineLanes(spans, (gapPixels / width) * (domain.end - domain.start));
  const laneCount = Math.min(Math.max(0, ...lanes) + 1, maxLanes);
  const axisY = 26 + laneCount * laneHeight;
  const shaded = brushed ?? searched;
  const summary = summarizeTimeline(allSpans);
  return (
    <svg
      ref={svgRef}
      role="img"
      aria-labelledby="period-timeline-title period-timeline-desc"
      viewBox={`0 0 ${width} ${axisY + 36}`}
      className="h-auto w-full cursor-crosshair touch-pan-y select-none text-[11px]"
      {...handlers}
    >
      <title id="period-timeline-title">Timeline of when connections were recorded</title>
      <desc id="period-timeline-desc">{describeTimeline(summary, from, to)}</desc>
      {shaded && (
        <g>
          <rect
            x={xOf(Math.min(shaded.start, shaded.end))}
            width={Math.max(1, Math.abs(xOf(shaded.end) - xOf(shaded.start)))}
            y={4}
            height={axisY - 4}
            className="fill-subtle"
          />
          <text x={xOf(Math.min(shaded.start, shaded.end)) + 4} y={15} className="fill-muted">
            {brushed ? "period to search" : "searched period"}
          </text>
        </g>
      )}
      {spans.map((span, index) => {
        const y = 26 + Math.min(lanes[index] ?? 0, maxLanes - 1) * laneHeight;
        return (
          <KindBar
            key={`${span.date} ${span.kind}`}
            from={{ x: xOf(span.start), y }}
            to={{ x: xOf(span.end), y }}
            kind={span.kind}
          >
            <title>{`${span.date}: ${span.count} × ${termLabel(span.kind)}`}</title>
          </KindBar>
        );
      })}
      <line x1={0} x2={width} y1={axisY} y2={axisY} className="stroke-faint" />
      {listTimelineTicks(domain).map(({ year, label }) => (
        <g key={year}>
          <line x1={xOf(year)} x2={xOf(year)} y1={axisY} y2={axisY + 4} className="stroke-faint" />
          <text
            x={xOf(year)}
            y={axisY + 15}
            textAnchor={anchorTickLabel(xOf(year), width)}
            className="fill-muted"
          >
            {label}
          </text>
        </g>
      ))}
      <text x={0} y={axisY + 32} className="fill-muted">
        {summary}. Drag across the timeline to search a period.
      </text>
    </svg>
  );
}

/** Spans the searched period, leaving an open end at the edge of the timeline. */
function spanPeriod(start: number | undefined, end: number | undefined, domain: YearSpan) {
  return { start: start ?? domain.start, end: end ?? domain.end } satisfies YearSpan;
}

/** Anchors a tick's label so that it stays inside the timeline when the tick lies near an edge. */
function anchorTickLabel(x: number, width: number) {
  const edgeMargin = 16;
  if (x < edgeMargin) return "start";
  return x > width - edgeMargin ? "end" : "middle";
}

function listDatedSpans(dates: DateSummary[]) {
  return dates.flatMap((summary) => {
    const span = parseDateSpan(summary.date);
    return span ? [{ ...summary, ...span } satisfies DatedSpan] : [];
  });
}

/** Says how many connections were recorded on how many distinct dates, such as "200 connections recorded on 1 date". */
function summarizeTimeline(spans: DatedSpan[]) {
  const connectionCount = spans.reduce((total, { count }) => total + count, 0);
  const dateCount = new Set(spans.map(({ date }) => date)).size;
  const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;
  return `${plural(connectionCount, "connection")} recorded on ${plural(dateCount, "date")}`;
}

function describeTimeline(summary: string, from: string | null, to: string | null) {
  const period = from || to ? `, with the period ${from ?? "…"} to ${to ?? "…"} searched` : "";
  return `${summary}${period}.`;
}
