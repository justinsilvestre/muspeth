import { lazy, Suspense } from "react";
import type { PlaceAndPeriodQuery } from "../../shared/placeAndPeriodQuery";
import type { PlaceSummary } from "../../shared/placeAndPeriodSummary";
import { readLatestData, useApiResource } from "../useApiResource";
import { ExplorerHeading } from "./ExplorerHeading";
import {
  searchAnywhere,
  searchNear,
  searchRadius,
  toPlaceSummaryParams,
} from "./placeSearchParams";
import { RadiusSlider } from "./RadiusSlider";

// The map's library is large, so it loads only when a map is first shown.
const PlaceMap = lazy(() => import("./PlaceMap").then(({ PlaceMap }) => ({ default: PlaceMap })));

type PlaceExplorerMapProps = {
  params: URLSearchParams;
  query: PlaceAndPeriodQuery;
  onSearch: (params: URLSearchParams, options?: { replace: boolean }) => void;
};

/** Maps every place where connections were recorded within the period, and searches near any point chosen on it. */
export function PlaceExplorerMap({ params, query, onSearch }: PlaceExplorerMapProps) {
  const resource = useApiResource<{ places: PlaceSummary[] }>(
    `/api/connections/places?${toPlaceSummaryParams(params)}`,
  );
  return (
    <div className="space-y-1">
      <ExplorerHeading
        title="Where"
        clearLabel="Search anywhere"
        onClear={query.near ? () => onSearch(searchAnywhere(params)) : undefined}
      >
        {query.near && (
          <RadiusSlider
            radiusKm={query.radiusKm}
            onChange={(radiusKm) => onSearch(searchRadius(params, radiusKm), { replace: true })}
          />
        )}
      </ExplorerHeading>
      <Suspense fallback={<div className="h-80 rounded border border-line bg-panel" />}>
        <PlaceMap
          near={query.near}
          radiusKm={query.radiusKm}
          places={readLatestData(resource)?.places ?? []}
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
