import { OrbitControls } from "@react-three/drei";
import type { RefObject } from "react";
import { useColorScheme } from "../../theme/useColorScheme";
import type { LanguageFamily } from "../glottometry/families";
import type { Appearance } from "./appearance";
import { CellBody } from "./CellBody";
import { PageCanvas } from "./PageCanvas";
import type { Hovered } from "./pickHovered";

type CellSceneProps = {
  /** The element of the page that frames the scene. */
  frame: RefObject<HTMLElement | null>;
  family: LanguageFamily;
  threshold: number;
  appearance: Appearance;
  hovered: Hovered | undefined;
  onHover: (hovered: Hovered | undefined) => void;
};

/** Renders the glottometric diagram of the Demo family as a slowly undulating cell. */
export default function CellScene(props: CellSceneProps) {
  const { frame, family, threshold, appearance, hovered, onHover } = props;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <PageCanvas
      frame={frame}
      camera={{ position: [0, -8, 13], fov: 40 }}
      onPointerMissed={() => onHover(undefined)}
    >
      <ambientLight intensity={isDark ? 0.5 : 0.9} />
      <directionalLight position={[4, 6, 8]} intensity={isDark ? 1.8 : 2.4} />
      <pointLight position={[0, 0, 3]} intensity={isDark ? 12 : 6} color="#ffe2b0" />
      <CellBody
        family={family}
        isDark={isDark}
        threshold={threshold}
        appearance={appearance}
        hovered={hovered}
        onHover={onHover}
      />
      <OrbitControls
        target={[0, -1, 0]}
        enablePan={false}
        minDistance={4}
        maxDistance={20}
        autoRotate={appearance.movement.autoRotate}
        autoRotateSpeed={0.6}
      />
    </PageCanvas>
  );
}
