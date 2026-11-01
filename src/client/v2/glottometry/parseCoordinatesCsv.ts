import { splitRows } from "./parseInnovationsCsv";

export type LanguageCoordinates = { name: string; latitude: number; longitude: number };

/** Parses a spatial-coordinates table with a header row followed by one row of name, latitude, and longitude per language. */
export function parseCoordinatesCsv(text: string) {
  return splitRows(text)
    .slice(1)
    .map(([name = "", latitude, longitude]) => ({
      name,
      latitude: Number(latitude),
      longitude: Number(longitude),
    })) satisfies LanguageCoordinates[];
}
