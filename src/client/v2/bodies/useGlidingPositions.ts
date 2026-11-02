import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { easeInOut, glidePositions, type Positions } from "./glidePositions";

/** How long a glide from one layout to the next takes, in seconds. */
const glideSeconds = 0.9;

/**
 * Follows a layout as it changes, moving each name smoothly from where it was to where it is going.
 * Returns the positions to draw now and how far the glide has come, from 0 at a change to 1 at rest.
 */
export function useGlidingPositions(target: Positions) {
  const [shown, setShown] = useState({ positions: target, progress: 1 });
  const lastShown = useRef(target);
  const glide = useRef({ from: target, to: target, progress: 1 });
  useEffect(() => {
    // A glide interrupted by a new target starts from wherever the dots are at that moment.
    glide.current = { from: lastShown.current, to: target, progress: 0 };
    const positions = glidePositions(glide.current.from, target, 0);
    lastShown.current = positions;
    setShown({ positions, progress: 0 });
  }, [target]);
  useFrame((_, delta) => {
    const current = glide.current;
    if (current.progress >= 1) return;
    current.progress = Math.min(1, current.progress + delta / glideSeconds);
    const positions = glidePositions(current.from, current.to, easeInOut(current.progress));
    lastShown.current = positions;
    setShown({ positions, progress: current.progress });
  });
  return shown;
}
