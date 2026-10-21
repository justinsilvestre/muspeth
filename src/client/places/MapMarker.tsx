import type { Map as MapLibreMap } from "maplibre-gl";
import { Marker } from "maplibre-gl";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Coordinates } from "../../shared/placeAndPeriodQuery";

type MapMarkerProps = {
  map: MapLibreMap;
  at: Coordinates;
  children: ReactNode;
};

/** Pins React content to a place on a MapLibre map, keeping it centred on that place as the map moves. */
export function MapMarker({ map, at: { latitude, longitude }, children }: MapMarkerProps) {
  const [element] = useState(() => document.createElement("div"));
  useEffect(() => {
    const marker = new Marker({ element }).setLngLat([longitude, latitude]).addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, element, latitude, longitude]);
  return createPortal(children, element);
}
