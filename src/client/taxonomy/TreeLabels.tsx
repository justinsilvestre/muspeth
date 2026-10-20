import { useFrame } from "@react-three/fiber";
import clsx from "clsx";
import { type RefObject, useMemo, useRef } from "react";
import { Vector3 } from "three";
import type { layoutTaxonTree } from "./layoutTaxonTree";
import { pickVisibleLabels } from "./pickVisibleLabels";

type Point = ReturnType<typeof layoutTaxonTree>["points"][number];
type LabelsById = RefObject<Map<string, HTMLElement>>;

/** Lays one HTML label per point over the canvas, hidden until the tracker shows it. */
export function TreeLabelOverlay({
  points,
  labelsById,
}: {
  points: Point[];
  labelsById: LabelsById;
}) {
  return (
    <div
      data-testid="tree-labels"
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      {points.map(({ node }) => (
        <span
          key={node.id}
          ref={(element) => {
            if (element) labelsById.current.set(node.id, element);
            else labelsById.current.delete(node.id);
          }}
          style={{ opacity: 0 }}
          className={clsx(
            "absolute top-0 left-0 whitespace-nowrap transition-opacity duration-300",
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
 * Moves each label to its point's position on screen once per frame.
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
  const shownById = useRef(new Map<string, boolean>());
  // Label text never changes, so each label is measured once, avoiding a layout pass per label per frame.
  const sizesById = useRef(new Map<string, [width: number, height: number]>());

  useFrame((state) => {
    const candidates = [];
    for (const point of points) {
      const label = labelsById.current.get(point.node.id);
      if (!label) continue;
      projected.set(point.position[0], point.position[1] + offsetY, point.position[2]);
      projected.project(state.camera);
      const x = ((projected.x + 1) / 2) * state.size.width;
      const y = ((1 - projected.y) / 2) * state.size.height;
      label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -150%)`;
      const priority = rankPriority(point, lineageIds);
      if (priority === null || projected.z > 1) continue;
      const size = sizesById.current.get(point.node.id) ?? [label.offsetWidth, label.offsetHeight];
      sizesById.current.set(point.node.id, size);
      const [width, height] = size;
      const rect = { left: x - width / 2, top: y - height * 1.5, width, height };
      candidates.push({ id: point.node.id, rect, priority, depth: projected.z });
    }
    candidates.sort((a, b) => a.priority - b.priority || a.depth - b.depth);
    const visibleIds = pickVisibleLabels(candidates);
    for (const [id, label] of labelsById.current) {
      const isShown = visibleIds.has(id);
      if (shownById.current.get(id) === isShown) continue;
      shownById.current.set(id, isShown);
      label.style.opacity = isShown ? "1" : "0";
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
