import type { Coordinates } from "../../shared/placeAndPeriodQuery";

/** A longitude and latitude, in the order that GeoJSON and MapLibre expect. */
export type LngLat = [number, number];

const earthRadiusKm = 6371;
const outlinePointCount = 64;

/** Outlines the circle of a search radius about a place, as a closed ring of points. */
export function traceCircle(centre: Coordinates, radiusKm: number) {
  const outline: LngLat[] = [];
  for (let index = 0; index <= outlinePointCount; index++) {
    const bearing = ((index % outlinePointCount) / outlinePointCount) * 2 * Math.PI;
    outline.push(travel(centre, radiusKm, bearing));
  }
  return outline;
}

/**
 * Chooses the south-west and north-east corners for a map to show:
 * the search radius when a place was searched, and otherwise every place given, or null when there are none.
 */
export function chooseMapBounds(near: Coordinates | null, radiusKm: number, places: Coordinates[]) {
  const points = near
    ? traceCircle(near, radiusKm)
    : places.map(({ longitude, latitude }) => [longitude, latitude] satisfies LngLat);
  if (points.length === 0) return null;
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ] satisfies [LngLat, LngLat];
}

/** Finds the point reached by travelling a distance from a place along a great circle, at a bearing in radians from north. */
function travel({ latitude, longitude }: Coordinates, distanceKm: number, bearing: number) {
  const angle = distanceKm / earthRadiusKm;
  const [startLatitude, startLongitude] = [toRadians(latitude), toRadians(longitude)];
  const endLatitude = Math.asin(
    Math.sin(startLatitude) * Math.cos(angle) +
      Math.cos(startLatitude) * Math.sin(angle) * Math.cos(bearing),
  );
  const endLongitude =
    startLongitude +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angle) * Math.cos(startLatitude),
      Math.cos(angle) - Math.sin(startLatitude) * Math.sin(endLatitude),
    );
  return [toDegrees(endLongitude), toDegrees(endLatitude)] satisfies LngLat;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}
