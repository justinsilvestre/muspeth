import type { Coordinates } from "../shared/placeAndPeriodQuery";
import { allOf, type SqlCondition } from "./sqlCondition";

const kmPerDegreeOfLatitude = 111.19;

/** Keeps connections inside a box that encloses the circle, which an exact distance check then narrows. */
export function boundingBoxSql({ latitude, longitude }: Coordinates, radiusKm: number) {
  const latitudeChange = radiusKm / kmPerDegreeOfLatitude;
  const latitudes = {
    sql: "latitude BETWEEN ? AND ? AND longitude IS NOT NULL",
    bindings: [latitude - latitudeChange, latitude + latitudeChange],
  } satisfies SqlCondition;
  const longitudeChange = maxLongitudeChange(latitude, radiusKm);
  return longitudeChange === null
    ? latitudes
    : allOf([latitudes, longitudeRangeSql(longitude, longitudeChange)]);
}

/** Returns how far in longitude a circle reaches from its centre, or null when it covers a pole. */
function maxLongitudeChange(latitude: number, radiusKm: number) {
  const angularRadius = radiusKm / kmPerDegreeOfLatitude;
  if (Math.abs(latitude) + angularRadius >= 90) return null;
  const toRadians = Math.PI / 180;
  const ratio = Math.sin(angularRadius * toRadians) / Math.cos(latitude * toRadians);
  return ratio >= 1 ? null : Math.asin(ratio) / toRadians;
}

function longitudeRangeSql(longitude: number, change: number) {
  const [west, east] = [longitude - change, longitude + change];
  if (west < -180) return { sql: "longitude >= ? OR longitude <= ?", bindings: [west + 360, east] };
  if (east > 180) return { sql: "longitude >= ? OR longitude <= ?", bindings: [west, east - 360] };
  return { sql: "longitude BETWEEN ? AND ?", bindings: [west, east] } satisfies SqlCondition;
}
