import { OrbitControls } from "@react-three/drei";
import type { RefObject } from "react";
import { useColorScheme } from "../../theme/useColorScheme";
import type { InnovationTable } from "../glottometry/parseInnovationsCsv";
import type { Appearance } from "../scene/appearance";
import { PageCanvas } from "../scene/PageCanvas";
import type { Hovered } from "../scene/pickHovered";
import { BodiesCell } from "./BodiesCell";
import type { BodySet } from "./BodySet";

type BodiesSceneProps = {
  /** The element of the page that frames the scene. */
  frame: RefObject<HTMLElement | null>;
  set: BodySet;
  /** A number that, when it changes, brings the whole diagram back into view. */
  fitRequest: number;
  fullTable: InnovationTable;
  table: InnovationTable;
  threshold: number;
  appearance: Appearance;
  hovered: Hovered | undefined;
  onHover: (hovered: Hovered | undefined) => void;
};

/** Renders a set of bodies and their membranes as a slowly undulating cell, lit as the glottometric cell is. */
export default function BodiesScene(props: BodiesSceneProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <PageCanvas
      frame={props.frame}
      camera={{ position: [0, -8, 13], fov: 40 }}
      onPointerMissed={() => props.onHover(undefined)}
    >
      <ambientLight intensity={isDark ? 0.5 : 0.9} />
      <directionalLight position={[4, 6, 8]} intensity={isDark ? 1.8 : 2.4} />
      <pointLight position={[0, 0, 3]} intensity={isDark ? 12 : 6} color="#ffe2b0" />
      <BodiesCell isDark={isDark} {...props} />
      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={60}
        autoRotate={props.appearance.movement.autoRotate}
        autoRotateSpeed={0.6}
      />
    </PageCanvas>
  );
}
