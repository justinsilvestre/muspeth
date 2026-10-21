import { type GeoJSONSource, Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import type { Coordinates } from "../../shared/placeAndPeriodQuery";
import { type LngLat, traceCircle } from "./placeMapGeometry";

export type SearchArea = { centre: Coordinates; radiusKm: number };

// MapLibre looks for its worker beside its own module, which Vite moves when it bundles dependencies.
setWorkerUrl(workerUrl);

/** A stone grey that reads against both the light and the dark map styles. */
const searchAreaColor = "#78716c";
export const fitBoundsOptions = { padding: 32, maxZoom: 10 };

/**
 * Creates a map in the container that shows the bounds, or the whole world when there are none,
 * with an empty search area that `showSearchArea` fills once the map has loaded.
 * Returns null when the browser cannot draw maps, such as when WebGL is unavailable.
 */
export function createPlaceMap(
  container: HTMLElement,
  styleUrl: string,
  bounds: [LngLat, LngLat] | null,
) {
  try {
    const map = new MapLibreMap({
      container,
      style: styleUrl,
      cooperativeGestures: true,
      attributionControl: { compact: true },
      ...(bounds ? { bounds, fitBoundsOptions } : { center: [0, 20], zoom: 0 }),
    });
    map.on("style.load", () => addSearchAreaLayers(map));
    return map;
  } catch {
    return null;
  }
}

/** Outlines the search area on a loaded map, or clears the outline when there is none. */
export function showSearchArea(map: MapLibreMap, area: SearchArea | null) {
  map.getSource<GeoJSONSource>("search-area")?.setData({
    type: "FeatureCollection",
    features: area ? [outlineOf(area)] : [],
  });
}

function addSearchAreaLayers(map: MapLibreMap) {
  map.addSource("search-area", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "search-area-fill",
    type: "fill",
    source: "search-area",
    paint: { "fill-color": searchAreaColor, "fill-opacity": 0.12 },
  });
  map.addLayer({
    id: "search-area-outline",
    type: "line",
    source: "search-area",
    paint: { "line-color": searchAreaColor, "line-width": 1.5, "line-dasharray": [3, 2] },
  });
}

function outlineOf({ centre, radiusKm }: SearchArea) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [traceCircle(centre, radiusKm)] },
  };
}
