import type { LanguageCoordinates } from "./parseCoordinatesCsv";

export type PlanePoint = { x: number; y: number };

/**
 * Places each language on a plane according to its geographic position, with north upward,
 * centered on the origin and scaled so that the languages span the given extent on their longer axis.
 */
export function layoutLanguages(coordinates: LanguageCoordinates[], extent: number) {
  const longitudes = coordinates.map((language) => language.longitude);
  const latitudes = coordinates.map((language) => language.latitude);
  const centerX = midpoint(longitudes);
  const centerY = midpoint(latitudes);
  const scale = extent / Math.max(range(longitudes), range(latitudes));
  return new Map(
    coordinates.map(({ name, longitude, latitude }) => [
      name,
      { x: (longitude - centerX) * scale, y: (latitude - centerY) * scale } satisfies PlanePoint,
    ]),
  );
}

function midpoint(values: number[]) {
  return (Math.min(...values) + Math.max(...values)) / 2;
}

function range(values: number[]) {
  return Math.max(...values) - Math.min(...values);
}
