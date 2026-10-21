import { lazy, Suspense } from "react";
import type { PlaceAndPeriodQuery, PlacedConnection } from "../../shared/placeAndPeriodQuery";
import { PeriodTimeline } from "./PeriodTimeline";

// The map's library is large, so it loads only when a map is first shown.
const PlaceMap = lazy(() => import("./PlaceMap").then(({ PlaceMap }) => ({ default: PlaceMap })));

type PlacedConnectionGraphicsProps = {
  query: PlaceAndPeriodQuery;
  connections: PlacedConnection[];
};

/** Shows where and when the connections found were recorded, beside the searched place and period. */
export function PlacedConnectionGraphics({ query, connections }: PlacedConnectionGraphicsProps) {
  const hasPlaces = connections.some(({ latitude }) => latitude !== null);
  const hasDates = connections.some(({ date }) => date !== null);
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2">
      {(query.near || hasPlaces) && (
        <Suspense fallback={<div className="h-80 rounded border border-line bg-panel" />}>
          <PlaceMap near={query.near} radiusKm={query.radiusKm} connections={connections} />
        </Suspense>
      )}
      {hasDates && <PeriodTimeline from={query.from} to={query.to} connections={connections} />}
    </div>
  );
}
