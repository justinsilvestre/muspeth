/** The radii, in kilometres, that the radius slider moves between. */
export const radiusStepsKm = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];

/** Finds the index of the step nearest a radius, measuring nearness by ratio so that 35 km is nearer 25 km than 50 km. */
export function findNearestRadiusStep(radiusKm: number) {
  const distances = radiusStepsKm.map((step) => Math.abs(Math.log(step / radiusKm)));
  return distances.indexOf(Math.min(...distances));
}
