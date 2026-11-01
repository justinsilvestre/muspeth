import type { LanguageCoordinates } from "./parseCoordinatesCsv";

export type PlanePoint = { x: number; y: number };

/** Languages placed on the plane, with the scale that placed them. */
export type LanguageLayout = { positions: Map<string, PlanePoint>; unitsPerDegree: number };

/**
 * Places each language on a plane according to its geographic position, with north upward and east to the right,
 * centered on the origin and scaled so that the languages span the given extent on their longer axis.
 */
export function layoutLanguages(coordinates: LanguageCoordinates[], extent: number) {
  const longitudes = coordinates.map((language) => language.longitude);
  const latitudes = coordinates.map((language) => language.latitude);
  const centerX = midpoint(longitudes);
  const centerY = midpoint(latitudes);
  const unitsPerDegree = extent / Math.max(range(longitudes), range(latitudes));
  const positions = new Map(
    coordinates.map(({ name, longitude, latitude }) => [
      name,
      {
        x: (longitude - centerX) * unitsPerDegree,
        y: (latitude - centerY) * unitsPerDegree,
      } satisfies PlanePoint,
    ]),
  );
  return { positions, unitsPerDegree } satisfies LanguageLayout;
}

function midpoint(values: number[]) {
  return (Math.min(...values) + Math.max(...values)) / 2;
}

function range(values: number[]) {
  return Math.max(...values) - Math.min(...values);
}
