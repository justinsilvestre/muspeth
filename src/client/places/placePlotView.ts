import type { Coordinates } from "../../shared/placeAndPeriodQuery";

/** The region a plot shows, in degrees, and how much a degree of longitude is shrunk relative to one of latitude. */
export type PlotView = { west: number; east: number; south: number; north: number; xScale: number };

/** Roughly how many kilometres a degree of latitude spans. */
const kmPerDegree = 111.32;
/** How many radii the view reaches from the place in each direction. */
const radiiInView = 4;

const world = { west: -180, east: 180, south: -90, north: 90, xScale: 1 } satisfies PlotView;

/**
 * Chooses the region to plot on an equirectangular projection: a square about the place, or the whole world.
 * Longitudes are shrunk by the cosine of the place's latitude, so that the square and the radius look round.
 */
export function choosePlotView(near: Coordinates | null, radiusKm: number) {
  if (!near) return world;
  const xScale = Math.max(Math.cos(toRadians(near.latitude)), 0.1);
  const halfHeight = Math.max((radiiInView * radiusKm) / kmPerDegree, 0.05);
  const halfWidth = halfHeight / xScale;
  return {
    west: Math.max(near.longitude - halfWidth, -180),
    east: Math.min(near.longitude + halfWidth, 180),
    south: Math.max(near.latitude - halfHeight, -90),
    north: Math.min(near.latitude + halfHeight, 90),
    xScale,
  } satisfies PlotView;
}

/** Gives the height of a plot of the view at the given width. */
export function measurePlotHeight(view: PlotView, width: number) {
  return (width * (view.north - view.south)) / ((view.east - view.west) * view.xScale);
}

/** Places a point on a plot of the view at the given width. */
export function projectPoint(view: PlotView, point: Coordinates, width: number) {
  const height = measurePlotHeight(view, width);
  return {
    x: ((point.longitude - view.west) / (view.east - view.west)) * width,
    y: ((view.north - point.latitude) / (view.north - view.south)) * height,
  };
}

/** Gives the horizontal and vertical radii of the ellipse that a search radius about a place makes on the plot. */
export function projectRadius(view: PlotView, near: Coordinates, radiusKm: number, width: number) {
  const radiusDegrees = radiusKm / kmPerDegree;
  const height = measurePlotHeight(view, width);
  const longitudeScale = Math.max(Math.cos(toRadians(near.latitude)), 0.01);
  return {
    rx: (radiusDegrees / longitudeScale / (view.east - view.west)) * width,
    ry: (radiusDegrees / (view.north - view.south)) * height,
  };
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
