import { OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { BranchTube } from "./BranchTube";
import type { TaxonTreeNode } from "./buildTaxonTree";
import { layoutTaxonTree } from "./layoutTaxonTree";
import { listLineageIds } from "./listLineageIds";
import { TreeLabelOverlay, TreeLabelTracker } from "./TreeLabels";

type Point = ReturnType<typeof layoutTaxonTree>["points"][number];

/**
 * Renders the taxonomic tree as a slowly turning 3D form that the viewer can rotate and zoom.
 * Pointing at a branch or point reveals the names along its lineage.
 */
export default function TaxonTreeScene({ tree }: { tree: TaxonTreeNode }) {
  const { points, branches } = useMemo(() => layoutTaxonTree(tree), [tree]);
  const parentIdsById = useMemo(
    () => new Map(points.map((point) => [point.node.id, point.parentId])),
    [points],
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const lineageIds = listLineageIds(parentIdsById, hoveredId);
  const labelsById = useRef(new Map<string, HTMLElement>());
  const height = Math.max(...points.map((point) => point.position[1]));
  /** Highlights the given lineage for the nearest object under the pointer only. */
  const hover = (id: string | null) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHoveredId(id);
  };

  return (
    <div className="relative h-full">
      <Canvas camera={{ position: [height * 1.2, height * 0.3, height * 1.2], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 12, 4]} intensity={1.5} />
        <group position={[0, -height / 2, 0]}>
          {branches.map((branch) => (
            <BranchTube
              key={branch.childId}
              branch={branch}
              isHighlighted={lineageIds.has(branch.childId)}
              onPointerOver={hover(branch.childId)}
              onPointerOut={hover(null)}
            />
          ))}
          {points.map((point) => (
            <mesh
              key={point.node.id}
              position={point.position}
              onPointerOver={hover(point.node.id)}
              onPointerOut={hover(null)}
            >
              <sphereGeometry args={[isOrganism(point) ? 0.16 : 0.07, 24, 16]} />
              <meshStandardMaterial color={pointColor(point, lineageIds.has(point.node.id))} />
            </mesh>
          ))}
        </group>
        <TreeLabelTracker points={points} offsetY={-height / 2} labelsById={labelsById} />
        <OrbitControls autoRotate={hoveredId === null} autoRotateSpeed={0.5} enablePan={false} />
      </Canvas>
      <TreeLabelOverlay points={points} lineageIds={lineageIds} labelsById={labelsById} />
    </div>
  );
}

function isOrganism(point: Point) {
  return point.node.rank === "organism";
}

function pointColor(point: Point, isHighlighted: boolean) {
  if (isOrganism(point)) return isHighlighted ? "#6aa86c" : "#4d7c4f";
  return isHighlighted ? "#c08552" : "#8a6a50";
}
