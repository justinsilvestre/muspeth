import { Vector3 } from "three";
import type { PlanePoint } from "../glottometry/layoutLanguages";
import { TextSprite } from "./TextSprite";

const east = new Vector3(1, 0, 0);
const north = new Vector3(0, 1, 0);
const degreesShown = 0.5;

type GeographicAxesProps = {
  /** The corner the two arrows start from. */
  origin: PlanePoint;
  unitsPerDegree: number;
  color: string;
};

/** Shows which way is north and east on the diagram's plane, with each arrow spanning half a degree. */
export function GeographicAxes({ origin, unitsPerDegree, color }: GeographicAxesProps) {
  const length = degreesShown * unitsPerDegree;
  const start = new Vector3(origin.x, origin.y, 0);
  return (
    <group>
      <arrowHelper args={[east, start, length, color, 0.3, 0.15]} />
      <arrowHelper args={[north, start, length, color, 0.3, 0.15]} />
      <group position={[origin.x + length + 0.9, origin.y, 0]}>
        <TextSprite text={`${degreesShown}° E`} color={color} height={0.4} />
      </group>
      <group position={[origin.x, origin.y + length + 0.4, 0]}>
        <TextSprite text={`${degreesShown}° N`} color={color} height={0.4} />
      </group>
    </group>
  );
}
