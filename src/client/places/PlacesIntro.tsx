import { Link } from "react-router";
import type { ConnectionKind } from "../../shared/graph";
import { KindBar } from "../graphics/KindBar";
import { KindDot } from "../graphics/KindDot";

const examples = [
  { label: "Near Mt. Kushigata, Japan", query: "near=35.5833,138.3833&radiusKm=25" },
  { label: "Near Mt. Yufu, Japan", query: "near=33.4,131.5&radiusKm=25" },
  { label: "From 1990 to 1992", query: "from=1990&to=1992" },
];

const dotsInside = [
  { kind: "interaction", x: 58, y: 48 },
  { kind: "likeness", x: 84, y: 66 },
  { kind: "shared_place_and_sound", x: 66, y: 76 },
] satisfies { kind: ConnectionKind; x: number; y: number }[];

const barsInside = [
  { kind: "interaction", from: 236, to: 262, y: 56 },
  { kind: "shared_culture", from: 272, to: 300, y: 70 },
] satisfies { kind: ConnectionKind; from: number; to: number; y: number }[];

/** Explains searching by place and period, with example searches. */
export function PlacesIntro() {
  return (
    <div className="space-y-3 rounded border border-line bg-panel p-4">
      <IntroDiagram />
      <p className="text-muted text-sm">
        Find the connections recorded near a place, within a period, or both. Click the map, or a
        mark on it, to search near that point. You can also give a place as a latitude, a longitude
        and a radius in kilometres, and a period as a year, month or day.
      </p>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="text-muted">Try</span>
        {examples.map(({ label, query }) => (
          <Link key={query} to={`/places?${query}`} className="underline underline-offset-2">
            {label}
          </Link>
        ))}
      </p>
    </div>
  );
}

function IntroDiagram() {
  return (
    <svg
      role="img"
      aria-labelledby="places-intro-title places-intro-desc"
      viewBox="0 0 360 136"
      className="h-auto w-full max-w-[420px] text-[13px]"
    >
      <title id="places-intro-title">How searching by place and period works</title>
      <desc id="places-intro-desc">
        Give a place as a point and a radius to find the connections recorded within that distance
        of it, a period from one date to another to find those recorded within it, or both.
      </desc>
      <circle cx={70} cy={62} r={40} strokeDasharray="4 3" className="fill-subtle stroke-muted" />
      <path d="M 64 62 h 12 M 70 56 v 12" className="stroke-2 stroke-ink" />
      {dotsInside.map(({ kind, x, y }) => (
        <KindDot key={kind} at={{ x, y }} kind={kind} />
      ))}
      <circle cx={130} cy={30} r={4} className="fill-faint" />
      <circle cx={18} cy={104} r={4} className="fill-faint" />
      <text x={70} y={124} textAnchor="middle" className="fill-ink font-medium">
        near a place
      </text>
      <rect x={226} y={34} width={84} height={56} className="fill-subtle" />
      <line x1={190} x2={350} y1={90} y2={90} className="stroke-faint" />
      {barsInside.map(({ kind, from, to, y }) => (
        <KindBar key={kind} from={{ x: from, y }} to={{ x: to, y }} kind={kind} />
      ))}
      <line
        x1={198}
        x2={210}
        y1={64}
        y2={64}
        className="stroke-[6] stroke-faint [stroke-linecap:round]"
      />
      <line
        x1={330}
        x2={340}
        y1={50}
        y2={50}
        className="stroke-[6] stroke-faint [stroke-linecap:round]"
      />
      <text x={268} y={124} textAnchor="middle" className="fill-ink font-medium">
        within a period
      </text>
    </svg>
  );
}
