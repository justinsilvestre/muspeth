import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import type { Coordinates } from "../../shared/placeAndPeriodQuery";
import { type LngLat, traceCircle } from "./placeMapGeometry";

type SearchArea = { centre: Coordinates; radiusKm: number };

// MapLibre looks for its worker beside its own module, which Vite moves when it bundles dependencies.
setWorkerUrl(workerUrl);

/** A stone grey that reads against both the light and the dark map styles. */
const searchAreaColor = "#78716c";

/**
 * Creates a map in the container that shows the bounds, or the whole world when there are none, and outlines the search area if given.
 * Returns null when the browser cannot draw maps, such as when WebGL is unavailable.
 */
export function createPlaceMap(
  container: HTMLElement,
  styleUrl: string,
  bounds: [LngLat, LngLat] | null,
  searchArea: SearchArea | null,
) {
  try {
    const map = new MapLibreMap({
      container,
      style: styleUrl,
      cooperativeGestures: true,
      attributionControl: { compact: true },
      ...(bounds
        ? { bounds, fitBoundsOptions: { padding: 32, maxZoom: 10 } }
        : { center: [0, 20], zoom: 0 }),
    });
    if (searchArea) map.on("style.load", () => outlineSearchArea(map, searchArea));
    return map;
  } catch {
    return null;
  }
}

function outlineSearchArea(map: MapLibreMap, { centre, radiusKm }: SearchArea) {
  map.addSource("search-area", {
    type: "geojson",
    data: { type: "Polygon", coordinates: [traceCircle(centre, radiusKm)] },
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
