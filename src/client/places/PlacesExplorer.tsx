import { lazy, Suspense } from "react";
import type { PlaceAndPeriodQuery } from "../../shared/placeAndPeriodQuery";
import type { PlaceSummary } from "../../shared/placeAndPeriodSummary";
import { useApiResource } from "../useApiResource";
import { searchNear, toPlaceSummaryParams } from "./placeSearchParams";

// The map's library is large, so it loads only when a map is first shown.
const PlaceMap = lazy(() => import("./PlaceMap").then(({ PlaceMap }) => ({ default: PlaceMap })));

type PlacesExplorerProps = {
  params: URLSearchParams;
  /** The query that `params` holds, already read. */
  query: PlaceAndPeriodQuery;
  onSearch: (params: URLSearchParams) => void;
};

/** Maps every place where connections were recorded within the period, and searches near any point chosen on it. */
export function PlacesExplorer({ params, query, onSearch }: PlacesExplorerProps) {
  const resource = useApiResource<{ places: PlaceSummary[] }>(
    `/api/connections/places?${toPlaceSummaryParams(params)}`,
  );
  const loaded = resource.status === "loading" ? resource.previous : resource;
  const places = loaded && "data" in loaded ? loaded.data.places : [];
  return (
    <div className="space-y-1">
      <Suspense fallback={<div className="h-80 rounded border border-line bg-panel" />}>
        <PlaceMap
          near={query.near}
          radiusKm={query.radiusKm}
          places={places}
          onPick={(near) => onSearch(searchNear(params, near))}
        />
      </Suspense>
      {resource.status === "failed" && (
        <p role="alert" className="text-sm">
          Could not load the places: {resource.error.message}
        </p>
      )}
    </div>
  );
}
