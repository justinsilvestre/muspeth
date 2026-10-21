import type { PlaceAndPeriodQuery, PlacedConnection } from "../../shared/placeAndPeriodQuery";
import { PeriodTimeline } from "./PeriodTimeline";
import { PlacePlot } from "./PlacePlot";

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
        <PlacePlot near={query.near} radiusKm={query.radiusKm} connections={connections} />
      )}
      {hasDates && <PeriodTimeline from={query.from} to={query.to} connections={connections} />}
    </div>
  );
}
