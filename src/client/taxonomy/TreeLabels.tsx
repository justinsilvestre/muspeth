import { useFrame } from "@react-three/fiber";
import clsx from "clsx";
import { type RefObject, useMemo } from "react";
import { Vector3 } from "three";
import type { layoutTaxonTree } from "./layoutTaxonTree";

type Point = ReturnType<typeof layoutTaxonTree>["points"][number];
type LabelsById = RefObject<Map<string, HTMLElement>>;

/**
 * Lays one HTML label per point over the canvas.
 * Organisms and kingdoms are always labelled; other taxa only while their lineage is highlighted.
 */
export function TreeLabelOverlay(props: {
  points: Point[];
  lineageIds: Set<string>;
  labelsById: LabelsById;
}) {
  const { points, lineageIds, labelsById } = props;
  return (
    <div data-testid="tree-labels" className="pointer-events-none absolute inset-0 overflow-hidden">
      {points.map(({ node }) => (
        <span
          key={node.id}
          ref={(element) => {
            if (element) labelsById.current.set(node.id, element);
            else labelsById.current.delete(node.id);
          }}
          className={clsx(
            "absolute top-0 left-0 whitespace-nowrap transition-opacity",
            node.rank === "organism" ? "font-medium text-sm" : "text-stone-600 text-xs",
            node.rank === "organism" &&
              (node.isPlacementUncertain ? "text-amber-700 italic" : "text-stone-900"),
            !isAlwaysLabelled(node.rank) && !lineageIds.has(node.id) && "opacity-0",
          )}
        >
          {node.label}
          {node.isPlacementUncertain && (
            <span className="ml-0.5" title="Placement uncertain">
              ?
            </span>
          )}
          {node.rank !== "organism" && node.rank !== "root" && (
            <span className="ml-1 text-stone-400">{node.rank}</span>
          )}
        </span>
      ))}
    </div>
  );
}

/** Moves each label to its point's position on screen, once per frame. */
export function TreeLabelTracker(props: {
  points: Point[];
  offsetY: number;
  labelsById: LabelsById;
}) {
  const { points, offsetY, labelsById } = props;
  const projected = useMemo(() => new Vector3(), []);

  useFrame(({ camera, size }) => {
    for (const point of points) {
      const label = labelsById.current.get(point.node.id);
      if (!label) continue;
      projected.set(point.position[0], point.position[1] + offsetY, point.position[2]);
      projected.project(camera);
      const x = ((projected.x + 1) / 2) * size.width;
      const y = ((1 - projected.y) / 2) * size.height;
      label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -150%)`;
    }
  });

  return null;
}

function isAlwaysLabelled(rank: string) {
  return rank === "organism" || rank === "kingdom";
}
