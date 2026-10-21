import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { type Coordinates, formatNearParam } from "../../shared/placeAndPeriodQuery";
import type { PlaceSummary } from "../../shared/placeAndPeriodSummary";
import { KindMark } from "../KindMark";
import { termLabel } from "../termLabel";
import type { ColorScheme } from "../theme/colorSchemePreference";
import { useColorScheme } from "../theme/useColorScheme";
import { createPlaceMap, fitBoundsOptions, showSearchArea } from "./createPlaceMap";
import { formatLatitude, formatLongitude } from "./formatCoordinates";
import { MapMarker } from "./MapMarker";
import { chooseMapBounds } from "./placeMapGeometry";

type PlaceMapProps = {
  near: Coordinates | null;
  radiusKm: number;
  places: PlaceSummary[];
  /** Searches near a point that was clicked on the map or chosen from its marks. */
  onPick: (near: Coordinates) => void;
};

const styleUrlByScheme = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
} satisfies Record<ColorScheme, string>;

/** Maps where connections were recorded and the area searched, and searches wherever it is clicked. */
export function PlaceMap({ near, radiusKm, places, onPick }: PlaceMapProps) {
  const { colorScheme } = useColorScheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const boundsKey = JSON.stringify(chooseMapBounds(near, radiusKm, places));
  const [latitude, longitude] = [near?.latitude, near?.longitude];
  // The search area last chosen on the map, which needs no refitting since it is already in view.
  const pickedAreaRef = useRef<string | null>(null);
  const pick = (picked: Coordinates) => {
    pickedAreaRef.current = `${formatNearParam(picked)} ${radiusKm}`;
    onPick(picked);
  };
  const readBounds = useEffectEvent(() => JSON.parse(boundsKey));
  const pickClickedPoint = useEffectEvent(({ lngLat, originalEvent }: MapMouseEvent) => {
    // A click on a mark also reaches the map, but the mark handles it.
    if (originalEvent.target instanceof Element && originalEvent.target.closest("button")) return;
    pick({ latitude: lngLat.lat, longitude: lngLat.lng });
  });
  const wasPickedOnMap = useEffectEvent(
    () => !!near && `${formatNearParam(near)} ${radiusKm}` === pickedAreaRef.current,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const created = createPlaceMap(container, styleUrlByScheme[colorScheme], readBounds());
    if (!created) return setHasFailed(true);
    created.on("style.load", () => setIsStyleLoaded(true));
    created.on("click", pickClickedPoint);
    setMap(created);
    return () => {
      setMap(null);
      setIsStyleLoaded(false);
      created.remove();
    };
  }, [colorScheme]);

  useEffect(() => {
    const bounds = JSON.parse(boundsKey);
    if (map && bounds && !wasPickedOnMap()) map.fitBounds(bounds, fitBoundsOptions);
  }, [map, boundsKey]);

  useEffect(() => {
    if (!map || !isStyleLoaded) return;
    const centre =
      latitude !== undefined && longitude !== undefined ? { latitude, longitude } : null;
    showSearchArea(map, centre && { centre, radiusKm });
  }, [map, isStyleLoaded, latitude, longitude, radiusKm]);

  return (
    <section
      aria-labelledby="place-map-title"
      aria-describedby="place-map-desc"
      className="relative h-80 w-full overflow-hidden rounded border border-line bg-panel"
    >
      <h3 id="place-map-title" className="sr-only">
        Map of where connections were recorded
      </h3>
      <p id="place-map-desc" className="sr-only">
        {describeMap(places, near, radiusKm)}
      </p>
      <div ref={containerRef} className="size-full" />
      {hasFailed && (
        <p className="absolute inset-0 grid place-items-center p-4 text-center text-muted text-sm">
          This browser cannot draw the map.
        </p>
      )}
      {map && near && (
        <MapMarker map={map} at={near}>
          <SearchedPlaceMark />
        </MapMarker>
      )}
      {map &&
        places.map((summary) => (
          <MapMarker
            key={`${summary.latitude} ${summary.longitude} ${summary.kind}`}
            map={map}
            at={summary}
          >
            <PlaceSummaryMark summary={summary} onPick={pick} />
          </MapMarker>
        ))}
    </section>
  );
}

function PlaceSummaryMark({
  summary,
  onPick,
}: {
  summary: PlaceSummary;
  onPick: (near: Coordinates) => void;
}) {
  const { place, kind, count, latitude, longitude } = summary;
  const label = `${place ?? "Unnamed place"}: ${count} × ${termLabel(kind)}`;
  return (
    <button
      type="button"
      title={label}
      aria-label={`Search near ${label}`}
      onClick={() => onPick({ latitude, longitude })}
      className="flex cursor-pointer rounded-full bg-page p-0.5 shadow"
    >
      <KindMark kind={kind} shape="dot" />
    </button>
  );
}

function SearchedPlaceMark() {
  return (
    <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden="true">
      <path d="M 1 7 h 12 M 7 1 v 12" className="stroke-2 stroke-ink" />
    </svg>
  );
}

function describeMap(places: PlaceSummary[], near: Coordinates | null, radiusKm: number) {
  const count = places.reduce((total, summary) => total + summary.count, 0);
  const marked = `${count} ${count === 1 ? "connection" : "connections"} marked at ${places.length} ${places.length === 1 ? "place" : "places"}`;
  const searched = near
    ? `, around a search area of ${radiusKm} km about ${formatLatitude(near.latitude)}, ${formatLongitude(near.longitude)}`
    : "";
  return `${marked}${searched}. Click the map, or choose a mark, to search near it.`;
}
