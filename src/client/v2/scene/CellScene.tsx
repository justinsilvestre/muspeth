import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useColorScheme } from "../../theme/useColorScheme";
import type { Appearance } from "./appearance";
import { CellBody } from "./CellBody";

type CellSceneProps = { threshold: number; appearance: Appearance };

/** Renders the glottometric diagram of the Demo family as a slowly undulating cell. */
export default function CellScene({ threshold, appearance }: CellSceneProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <Canvas camera={{ position: [0, -7, 12], fov: 40 }}>
      <ambientLight intensity={isDark ? 0.5 : 0.9} />
      <directionalLight position={[4, 6, 8]} intensity={isDark ? 1.8 : 2.4} />
      <pointLight position={[0, 0, 3]} intensity={isDark ? 12 : 6} color="#ffe2b0" />
      <CellBody isDark={isDark} threshold={threshold} appearance={appearance} />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={20}
        autoRotate={appearance.movement.autoRotate}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
