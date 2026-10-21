import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import type { ConnectionKind } from "../../shared/graph";
import type { Coordinates, PlacedConnection } from "../../shared/placeAndPeriodQuery";
import { KindMark } from "../KindMark";
import { termLabel } from "../termLabel";
import type { ColorScheme } from "../theme/colorSchemePreference";
import { useColorScheme } from "../theme/useColorScheme";
import { createPlaceMap } from "./createPlaceMap";
import { formatLatitude, formatLongitude } from "./formatCoordinates";
import { MapMarker } from "./MapMarker";
import { chooseMapBounds } from "./placeMapGeometry";

type PlaceMapProps = {
  near: Coordinates | null;
  radiusKm: number;
  connections: PlacedConnection[];
};

type PlacedGroup = Coordinates & { kind: ConnectionKind; place: string | null; count: number };

const styleUrlByScheme = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
} satisfies Record<ColorScheme, string>;

/** Maps where connections were recorded, about the searched place and its radius or across every place found. */
export function PlaceMap({ near, radiusKm, connections }: PlaceMapProps) {
  const { colorScheme } = useColorScheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const groups = groupByPlaceAndKind(connections);
  const boundsKey = JSON.stringify(chooseMapBounds(near, radiusKm, groups));
  const [latitude, longitude] = [near?.latitude, near?.longitude];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const centre =
      latitude !== undefined && longitude !== undefined ? { latitude, longitude } : null;
    const created = createPlaceMap(
      container,
      styleUrlByScheme[colorScheme],
      JSON.parse(boundsKey),
      centre && { centre, radiusKm },
    );
    if (!created) return setHasFailed(true);
    created.once("load", () => setMap(created));
    return () => {
      setMap(null);
      created.remove();
    };
  }, [colorScheme, boundsKey, latitude, longitude, radiusKm]);

  const count = groups.reduce((total, group) => total + group.count, 0);
  return (
    <div
      role="img"
      aria-labelledby="place-map-title place-map-desc"
      className="relative h-80 w-full overflow-hidden rounded border border-line bg-panel"
    >
      <span id="place-map-title" className="sr-only">
        Map of where the connections were recorded
      </span>
      <span id="place-map-desc" className="sr-only">
        {describeMap(count, near, radiusKm)}
      </span>
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
        groups.map((group) => (
          <MapMarker
            key={`${group.latitude} ${group.longitude} ${group.kind}`}
            map={map}
            at={group}
          >
            <span
              title={`${group.place ?? "Unnamed place"}: ${group.count} × ${termLabel(group.kind)}`}
              className="flex rounded-full bg-page p-0.5 shadow"
            >
              <KindMark kind={group.kind} shape="dot" />
            </span>
          </MapMarker>
        ))}
    </div>
  );
}

function SearchedPlaceMark() {
  return (
    <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden="true">
      <path d="M 1 7 h 12 M 7 1 v 12" className="stroke-2 stroke-ink" />
    </svg>
  );
}

/** Gathers connections recorded at the same place and of the same kind, so that each is marked once. */
function groupByPlaceAndKind(connections: PlacedConnection[]) {
  const groups = new Map<string, PlacedGroup>();
  for (const { latitude, longitude, kind, place } of connections) {
    if (latitude === null || longitude === null) continue;
    const key = `${latitude} ${longitude} ${kind}`;
    const count = (groups.get(key)?.count ?? 0) + 1;
    groups.set(key, { latitude, longitude, kind, place, count });
  }
  return [...groups.values()];
}

function describeMap(count: number, near: Coordinates | null, radiusKm: number) {
  const marked = `${count} ${count === 1 ? "connection" : "connections"} marked`;
  if (!near) return `${marked} on a map of the places found.`;
  return `${marked} within ${radiusKm} km of ${formatLatitude(near.latitude)}, ${formatLongitude(near.longitude)}.`;
}
