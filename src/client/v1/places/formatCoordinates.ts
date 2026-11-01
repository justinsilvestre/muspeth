/** Names a latitude, such as "35.5°N". */
export function formatLatitude(latitude: number) {
  return formatDegrees(latitude, "N", "S");
}

/** Names a longitude, such as "120°W". */
export function formatLongitude(longitude: number) {
  return formatDegrees(longitude, "E", "W");
}

function formatDegrees(value: number, positive: string, negative: string) {
  const magnitude = Number(Math.abs(value).toFixed(2));
  if (magnitude === 0) return "0°";
  return `${magnitude}°${value > 0 ? positive : negative}`;
}
