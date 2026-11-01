import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useColorScheme } from "../../theme/useColorScheme";
import type { Appearance } from "../scene/appearance";
import type { Hovered } from "../scene/pickHovered";
import { GuildBody } from "./GuildBody";
import type { PollinationNetwork, Side } from "./PollinationNetwork";

type GuildSceneProps = {
  network: PollinationNetwork;
  side: Side;
  minimumVisits: number;
  threshold: number;
  appearance: Appearance;
  hovered: Hovered | undefined;
  onHover: (hovered: Hovered | undefined) => void;
};

/** Renders one side of a pollination network as a slowly undulating cell, lit as the glottometric cell is. */
export default function GuildScene(props: GuildSceneProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <Canvas camera={{ position: [0, -8, 13], fov: 40 }}>
      <ambientLight intensity={isDark ? 0.5 : 0.9} />
      <directionalLight position={[4, 6, 8]} intensity={isDark ? 1.8 : 2.4} />
      <pointLight position={[0, 0, 3]} intensity={isDark ? 12 : 6} color="#ffe2b0" />
      <GuildBody isDark={isDark} {...props} />
      <OrbitControls
        target={[0, -1, 0]}
        enablePan={false}
        minDistance={4}
        maxDistance={20}
        autoRotate={props.appearance.movement.autoRotate}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
