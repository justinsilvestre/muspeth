import { OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { useColorScheme } from "../theme/useColorScheme";
import { BranchTube, branchRadius } from "./BranchTube";
import type { TaxonTreeNode } from "./buildTaxonTree";
import { layoutTaxonTree } from "./layoutTaxonTree";
import { listLineageIds } from "./listLineageIds";
import { TreeLabelOverlay, TreeLabelTracker } from "./TreeLabels";
import { treePalettes } from "./treePalette";

/**
 * Renders the taxonomic tree as a slowly turning 3D form that the viewer can rotate and zoom.
 * Pointing at a branch or organism reveals the names along its lineage.
 */
export default function TaxonTreeScene({ tree }: { tree: TaxonTreeNode }) {
  const { points, paths } = useMemo(() => layoutTaxonTree(tree), [tree]);
  const parentIdsById = useMemo(
    () => new Map(points.map((point) => [point.node.id, point.parentId])),
    [points],
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const lineageIds = listLineageIds(parentIdsById, hoveredId);
  const labelsById = useRef(new Map<string, HTMLElement>());
  const palette = treePalettes[useColorScheme().colorScheme];
  const heights = paths.flatMap((path) => path.positions.map((position) => position[1]));
  const [bottom, top] = [Math.min(...heights), Math.max(...heights)];
  const offsetY = -(bottom + top) / 2;
  const size = top - bottom;
  const leaves = points.filter((point) => point.node.children.length === 0);

  /** Highlights the given lineage for the nearest object under the pointer only. */
  const hover = (id: string | null) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHoveredId(id);
  };

  return (
    <div className="relative h-full">
      <Canvas camera={{ position: [size, size * 0.3, size], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 12, 4]} intensity={1.5} />
        <group position={[0, offsetY, 0]}>
          {paths.map((path) => (
            <BranchTube
              key={path.endId}
              path={path}
              color={lineageIds.has(path.endId) ? palette.barkHighlight : palette.bark}
              isCapped={path.leafCount > 1}
              onPointerOver={hover(path.endId)}
              onPointerOut={hover(null)}
            />
          ))}
          {leaves.map((leaf) => (
            <mesh
              key={leaf.node.id}
              position={leaf.position}
              onPointerOver={hover(leaf.node.id)}
              onPointerOut={hover(null)}
            >
              <sphereGeometry args={[branchRadius(1) * 3, 24, 16]} />
              <meshStandardMaterial
                color={lineageIds.has(leaf.node.id) ? palette.leafHighlight : palette.leaf}
              />
            </mesh>
          ))}
        </group>
        <TreeLabelTracker points={points} offsetY={offsetY} labelsById={labelsById} />
        <OrbitControls autoRotate={hoveredId === null} autoRotateSpeed={0.5} enablePan={false} />
      </Canvas>
      <TreeLabelOverlay points={points} lineageIds={lineageIds} labelsById={labelsById} />
    </div>
  );
}
