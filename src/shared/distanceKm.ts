export type Coordinates = { latitude: number; longitude: number };

/** Returns the great-circle distance between two points on the Earth, in kilometres. */
export function distanceKm(a: Coordinates, b: Coordinates) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeChange = toRadians(b.latitude - a.latitude);
  const longitudeChange = toRadians(b.longitude - a.longitude);
  const haversine =
    Math.sin(latitudeChange / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(longitudeChange / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(haversine)));
}
