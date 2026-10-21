import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { resizeCommonsImage } from "../media/resizeCommonsImage";
import { useColorScheme } from "../theme/useColorScheme";
import { BranchTube } from "./BranchTube";
import type { TaxonTreeNode } from "./buildTaxonTree";
import { findBarkMaterial } from "./graphics/barkMaterials";
import type { GraphicsSettings } from "./graphics/graphicsSettings";
import { useBarkMaterials } from "./graphics/useBarkMaterials";
import { LineageReadout } from "./LineageReadout";
import { layoutTaxonTree } from "./layoutTaxonTree";
import { listLineageIds } from "./listLineageIds";
import { listRepeatedTaxonIds } from "./listRepeatedTaxonIds";
import { TreeLabelOverlay, TreeLabelTracker } from "./TreeLabels";
import { treePalettes } from "./treePalette";
import { useLeafMaterials } from "./useLeafMaterials";

/**
 * Renders the taxonomic tree as a slowly turning 3D form that the viewer can rotate and zoom.
 * Pointing at a branch or leaf reveals the names along its lineage.
 */
export default function TaxonTreeScene(props: { tree: TaxonTreeNode; settings: GraphicsSettings }) {
  const { tree, settings } = props;
  const { leafSpread, branchSplay, irregularity } = settings;
  const { points, paths } = useMemo(
    () => layoutTaxonTree(tree, { leafSpread, splay: branchSplay, irregularity }),
    [tree, leafSpread, branchSplay, irregularity],
  );
  const parentIdsById = useMemo(
    () => new Map(points.map((point) => [point.node.id, point.parentId])),
    [points],
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const lineageIds = listLineageIds(parentIdsById, hoveredId);
  const nodesById = useMemo(
    () => new Map(points.map((point) => [point.node.id, point.node])),
    [points],
  );
  const lineage = [...lineageIds]
    .reverse()
    .flatMap((id) => nodesById.get(id) ?? [])
    .filter((node) => node.rank !== "root");
  // A taxon whose name its organism repeats goes unlabelled, so the name appears once.
  const repeatedTaxonIds = listRepeatedTaxonIds(lineage);
  // The root is left unlabelled, since its branches together form the trunk.
  const labelledLineageIds = new Set(
    [...lineageIds].filter((id) => id !== tree.id && !repeatedTaxonIds.has(id)),
  );
  const labelsById = useRef(new Map<string, HTMLElement>());
  const palette = treePalettes[useColorScheme().colorScheme];
  const { trunkRadius, taperPerRank } = settings;
  const shape = useMemo(() => ({ trunkRadius, taperPerRank }), [trunkRadius, taperPerRank]);
  const barkMaterials = useBarkMaterials(
    findBarkMaterial(settings.barkMaterialId),
    settings.shading,
  );
  const leafMaterials = useLeafMaterials(palette);
  const { leafSize, leafGap } = settings;
  const leafStyle = useMemo(
    () => ({ materials: leafMaterials, size: leafSize, gap: leafGap }),
    [leafMaterials, leafSize, leafGap],
  );
  const heights = paths.flatMap((path) => path.positions.map((position) => position[1]));
  const [bottom, top] = [Math.min(...heights), Math.max(...heights)];
  const offsetY = -(bottom + top) / 2;
  const size = top - bottom;

  return (
    <div className="relative h-full">
      {/* Rendering at most 1.5 device pixels per CSS pixel spares high-density screens much of the shading work. */}
      <Canvas camera={{ position: [size, size * 0.3, size], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 12, 4]} intensity={1.2} />
        {/* Soft studio lights, generated locally, give metals and gloss something to reflect. */}
        <Environment resolution={128}>
          <Lightformer
            intensity={3}
            position={[0, 10, 0]}
            rotation-x={Math.PI / 2}
            scale={[14, 14, 1]}
          />
          <Lightformer intensity={1.5} position={[0, 2, 10]} scale={[16, 6, 1]} />
          <Lightformer
            intensity={1}
            position={[-10, 2, 0]}
            rotation-y={Math.PI / 2}
            scale={[16, 4, 1]}
          />
          <Lightformer
            intensity={1}
            position={[10, 2, 0]}
            rotation-y={-Math.PI / 2}
            scale={[16, 4, 1]}
          />
        </Environment>
        <group position={[0, offsetY, 0]}>
          {paths.map((path) => (
            <BranchTube
              key={path.endId}
              path={path}
              shape={shape}
              barkMaterials={barkMaterials}
              leafStyle={leafStyle}
              isHighlighted={lineageIds.has(path.endId)}
              leafImageUrl={
                settings.showsLeafImages ? findLeafImageUrl(nodesById.get(path.endId)) : undefined
              }
              onHover={setHoveredId}
            />
          ))}
        </group>
        <TreeLabelTracker
          points={points}
          offsetY={offsetY}
          labelsById={labelsById}
          lineageIds={labelledLineageIds}
        />
        <OrbitControls autoRotate={hoveredId === null} autoRotateSpeed={0.5} enablePan={false} />
      </Canvas>
      <TreeLabelOverlay points={points} labelsById={labelsById} lineageIds={labelledLineageIds} />
      <LineageReadout lineage={lineage} />
    </div>
  );
}

function findLeafImageUrl(node: TaxonTreeNode | undefined) {
  return node?.media && resizeCommonsImage(node.media.url, 250);
}
