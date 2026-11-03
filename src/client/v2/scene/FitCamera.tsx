import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { type Camera, PerspectiveCamera, Vector3 } from "three";
import type { PlanePoint } from "../glottometry/layoutLanguages";

/** How much room the fit leaves around the points, as a share of their extent. */
const margin = 1.12;
/** The share of the remaining way the camera moves each frame, at sixty frames a second. */
const easing = 0.08;

type FitCameraProps = {
  /** The points to keep in view, in the diagram's own plane before the scene turns it. */
  points: PlanePoint[];
  /** How far beyond the points the view should reach, for membranes and labels. */
  padding: number;
  /** The angle the diagram is turned by about its center, in radians. */
  rotation: number;
  /** A number that, when it changes, fits the view again even if the points have not changed. */
  fitRequest?: number;
};

/**
 * Keeps the diagram in view: whenever the points, the padding or the request change, it moves the camera smoothly
 * to look at their center from far enough away, along the direction it is already looking from.
 */
export function FitCamera({ points, padding, rotation, fitRequest }: FitCameraProps) {
  const { camera, controls, size } = useThree();
  const goal = useRef<{ target: Vector3; direction: Vector3; bounds: Bounds } | undefined>(
    undefined,
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: a changed request or window size fits the view again without changing anything else.
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = boundsOf(points, rotation, padding);
    const target = new Vector3(bounds.centerX, bounds.centerY, 0);
    const from = orbitTarget(controls) ?? new Vector3(0, 0, 0);
    goal.current = { target, direction: camera.position.clone().sub(from).normalize(), bounds };
  }, [points, padding, rotation, fitRequest, camera, controls, size]);
  useFrame(() => {
    const target = orbitTarget(controls);
    if (!goal.current || !target) return;
    const position = goal.current.target
      .clone()
      .addScaledVector(goal.current.direction, fittingDistance(camera, goal.current.bounds));
    target.lerp(goal.current.target, easing);
    camera.position.lerp(position, easing);
    if (
      target.distanceTo(goal.current.target) < 0.01 &&
      camera.position.distanceTo(position) < 0.01
    )
      goal.current = undefined;
    (controls as { update?: () => void } | null)?.update?.();
  });
  return null;
}

/**
 * How far from the center of the bounds the camera must be for them to fill its view.
 * The view's aspect is read as the scene is drawn, since the camera's frame may be narrower than the canvas.
 */
function fittingDistance(camera: Camera, bounds: Bounds) {
  const fov = (camera instanceof PerspectiveCamera ? camera.fov : 40) * (Math.PI / 180);
  const aspect = camera instanceof PerspectiveCamera ? camera.aspect : 1;
  const tangent = Math.tan(fov / 2);
  return Math.max(bounds.halfHeight / tangent, bounds.halfWidth / (tangent * aspect)) * margin;
}

/** The orbit controls' target, when the scene's controls are orbit controls. */
function orbitTarget(controls: unknown) {
  const candidate = (controls as { target?: Vector3 } | null)?.target;
  return candidate instanceof Vector3 ? candidate : undefined;
}

type Bounds = ReturnType<typeof boundsOf>;

/** The extent of the points once turned, with the padding added on every side. */
function boundsOf(points: PlanePoint[], rotation: number, padding: number) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const xs = points.map((p) => p.x * cos - p.y * sin);
  const ys = points.map((p) => p.x * sin + p.y * cos);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    halfWidth: (maxX - minX) / 2,
    halfHeight: (maxY - minY) / 2,
  };
}
