import { useFrame } from "@react-three/fiber";
import clsx from "clsx";
import { type RefObject, useMemo } from "react";
import { Vector3 } from "three";
import type { layoutTaxonTree } from "./layoutTaxonTree";
import { pickVisibleLabels } from "./pickVisibleLabels";
import { useLingeringIds } from "./useLingeringIds";

type Point = ReturnType<typeof layoutTaxonTree>["points"][number];
type LabelsById = RefObject<Map<string, HTMLElement>>;

const fadeMs = 300;

/**
 * Lays an HTML label over the canvas for each point in the given lineage and for each kingdom, hidden until the tracker shows it.
 * A label stays a moment after its point leaves the lineage, so that it can fade out.
 */
export function TreeLabelOverlay(props: {
  points: Point[];
  labelsById: LabelsById;
  lineageIds: Set<string>;
}) {
  const { points, labelsById, lineageIds } = props;
  const kingdomPoints = useMemo(
    () => points.filter((point) => point.node.rank === "kingdom"),
    [points],
  );
  const labelledIds = useMemo(
    () => new Set([...lineageIds, ...kingdomPoints.map((point) => point.node.id)]),
    [lineageIds, kingdomPoints],
  );
  const mountedIds = useLingeringIds(labelledIds, fadeMs);

  return (
    <div
      data-testid="tree-labels"
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      {points
        .filter((point) => mountedIds.has(point.node.id))
        .map(({ node }) => (
          <span
            key={node.id}
            ref={(element) => {
              if (element) labelsById.current.set(node.id, element);
              else labelsById.current.delete(node.id);
            }}
            style={{ opacity: 0, transitionDuration: `${fadeMs}ms` }}
            className={clsx(
              "absolute top-0 left-0 whitespace-nowrap transition-opacity",
              // A stroke in the page color, painted beneath the text, haloes each label against busy branches.
              "[-webkit-text-stroke:3px_var(--color-page)] [paint-order:stroke_fill]",
              node.rank === "organism" ? "font-medium text-sm" : "text-muted text-xs",
              node.rank === "organism" &&
                (node.isPlacementUncertain
                  ? "text-amber-700 italic dark:text-amber-400"
                  : "text-ink"),
            )}
          >
            {node.label}
            {node.isPlacementUncertain && (
              <span className="ml-0.5" title="Placement uncertain">
                ?
              </span>
            )}
            {node.rank !== "organism" && node.rank !== "root" && (
              <span className="ml-1 text-faint">{node.rank}</span>
            )}
          </span>
        ))}
    </div>
  );
}

/**
 * Moves each mounted label to its point's position on screen once per frame.
 * It shows the highlighted lineage and the kingdoms, skipping any label that would overlap one with higher priority.
 */
export function TreeLabelTracker(props: {
  points: Point[];
  offsetY: number;
  labelsById: LabelsById;
  lineageIds: Set<string>;
}) {
  const { points, offsetY, labelsById, lineageIds } = props;
  const projected = useMemo(() => new Vector3(), []);
  const pointsById = useMemo(
    () => new Map(points.map((point) => [point.node.id, point])),
    [points],
  );
  // Label text never changes, so each label is measured once, avoiding a layout pass per label per frame.
  const sizesByLabel = useMemo(
    () => new WeakMap<HTMLElement, [width: number, height: number]>(),
    [],
  );

  useFrame((state) => {
    const candidates = [];
    for (const [id, label] of labelsById.current) {
      const point = pointsById.get(id);
      if (!point) continue;
      projected.set(point.position[0], point.position[1] + offsetY, point.position[2]);
      projected.project(state.camera);
      const x = ((projected.x + 1) / 2) * state.size.width;
      const y = ((1 - projected.y) / 2) * state.size.height;
      label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -150%)`;
      const priority = rankPriority(point, lineageIds);
      if (priority === null || projected.z > 1) continue;
      // Measuring a newly mounted label also settles its initial opacity, so that showing it fades it in.
      const size = sizesByLabel.get(label) ?? [label.offsetWidth, label.offsetHeight];
      sizesByLabel.set(label, size);
      const [width, height] = size;
      const rect = { left: x - width / 2, top: y - height * 1.5, width, height };
      candidates.push({ id, rect, priority, depth: projected.z });
    }
    candidates.sort((a, b) => a.priority - b.priority || a.depth - b.depth);
    const visibleIds = pickVisibleLabels(candidates);
    for (const [id, label] of labelsById.current) {
      const opacity = visibleIds.has(id) ? "1" : "0";
      if (label.style.opacity !== opacity) label.style.opacity = opacity;
    }
  });

  return null;
}

/** Returns how urgently a point needs its label, lowest first, or null if it should stay unlabelled. */
function rankPriority(point: Point, lineageIds: Set<string>) {
  if (lineageIds.has(point.node.id)) return 0;
  if (point.node.rank === "kingdom") return 1;
  return null;
}
