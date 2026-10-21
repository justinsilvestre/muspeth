import { measureCostBar } from "./measureCostBar";

const width = 64;

/** Draws a path's score as a short bar, scaled against the worst score in the list; a shorter bar ranks higher. */
export function CostBar({ cost, worstCost }: { cost: number; worstCost: number }) {
  const label = `Score ${cost.toFixed(2)}, against ${worstCost.toFixed(2)} for the lowest-ranked path`;
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} 8`}
      width={width}
      height={8}
      className="inline-block align-middle"
    >
      <title>{label}</title>
      <rect width={width} height={8} rx={4} className="fill-subtle" />
      <rect
        width={Math.max(8, width * measureCostBar(cost, worstCost))}
        height={8}
        rx={4}
        className="fill-faint"
      />
    </svg>
  );
}
