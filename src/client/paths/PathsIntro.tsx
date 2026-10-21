import { Link } from "react-router";
import type { ConnectionKind, NodeKind } from "../../shared/graph";
import { KindLine } from "../graphics/KindLine";
import { NodeKindShape } from "../graphics/NodeKindShape";

const examples = [
  { from: "wikidata:Q509308", to: "wikidata:Q15859794" },
  { from: "wikidata:Q509308", to: "wikidata:Q1044186" },
];

const chainNodes = [
  { kind: "organism", x: 30 },
  { kind: "compound", x: 130 },
  { kind: "cultural_object", x: 230 },
  { kind: "organism", x: 330 },
] satisfies { kind: NodeKind; x: number }[];

/** The kinds of the links between neighbouring nodes of the sketched chain, each with the x of the node it leaves. */
const chainLinks = [
  { kind: "interaction", x: 30 },
  { kind: "shared_substance", x: 130 },
  { kind: "shared_culture", x: 230 },
] satisfies { kind: ConnectionKind; x: number }[];

type PathsIntroProps = {
  nameOf: (nodeId: string) => string;
  kindOf: (nodeId: string) => NodeKind | undefined;
};

/** Explains what a path is and how paths are ranked, with example searches drawn from nodes that exist. */
export function PathsIntro({ nameOf, kindOf }: PathsIntroProps) {
  const available = examples.filter(({ from, to }) => kindOf(from) && kindOf(to));
  return (
    <div className="space-y-3 rounded border border-line bg-panel p-4">
      <IntroDiagram />
      <p className="text-muted text-sm">
        A path joins the two nodes you choose in up to four steps. Paths rank higher when they avoid
        hubs, the nodes with many neighbours, and when they mix different kinds of connection.
      </p>
      {available.length > 0 && (
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-muted">Try</span>
          {available.map(({ from, to }) => (
            <Link
              key={to}
              to={`/paths?${new URLSearchParams({ from, to })}`}
              className="underline underline-offset-2"
            >
              {nameOf(from)} → {nameOf(to)}
            </Link>
          ))}
        </p>
      )}
    </div>
  );
}

function IntroDiagram() {
  return (
    <svg
      role="img"
      aria-labelledby="paths-intro-title paths-intro-desc"
      viewBox="0 0 360 150"
      className="h-auto w-full max-w-[420px] text-[12px]"
    >
      <title id="paths-intro-title">How paths work</title>
      <desc id="paths-intro-desc">
        A path joins the two nodes you choose through up to four steps. Paths that avoid hubs, the
        nodes with many neighbours, and that mix different kinds of connection rank higher.
      </desc>
      {chainLinks.map(({ kind, x }) => (
        <KindLine key={kind} from={{ x: x + 13, y: 36 }} to={{ x: x + 87, y: 36 }} kind={kind} />
      ))}
      {chainNodes.map(({ kind, x }) => (
        <NodeKindShape key={x} kind={kind} at={{ x, y: 36 }} />
      ))}
      <text x={30} y={62} textAnchor="middle" className="fill-ink font-medium">
        From
      </text>
      <text x={180} y={62} textAnchor="middle" className="fill-muted">
        steps between, up to 4
      </text>
      <text x={330} y={62} textAnchor="middle" className="fill-ink font-medium">
        To
      </text>
      <HubSketch />
      <text x={64} y={126} className="fill-muted">
        hubs rank lower
      </text>
      {chainLinks.map(({ kind }, index) => (
        <KindLine
          key={kind}
          from={{ x: 176, y: 112 + index * 8 }}
          to={{ x: 200, y: 112 + index * 8 }}
          kind={kind}
        />
      ))}
      <text x={210} y={126} className="fill-muted">
        mixed kinds rank higher
      </text>
    </svg>
  );
}

/** Draws a node with many neighbours, standing for a hub. */
function HubSketch() {
  const spokes = Array.from({ length: 10 }, (_, index) => (2 * Math.PI * index) / 10);
  return (
    <g className="stroke-faint">
      {spokes.map((angle) => (
        <line
          key={angle}
          x1={36}
          y1={122}
          x2={36 + 18 * Math.cos(angle)}
          y2={122 + 18 * Math.sin(angle)}
        />
      ))}
      <NodeKindShape kind="organism" at={{ x: 36, y: 122 }} />
    </g>
  );
}
