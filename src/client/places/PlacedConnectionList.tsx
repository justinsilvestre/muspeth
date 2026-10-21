import type { PlaceAndPeriodQuery, PlacedConnection } from "../../shared/placeAndPeriodQuery";
import { ConnectionMeta } from "../ConnectionMeta";
import { ConnectionSentence } from "../ConnectionSentence";
import { useApiResource } from "../useApiResource";
import { PeriodTimeline } from "./PeriodTimeline";

type PlacedConnectionListProps = {
  params: URLSearchParams;
  /** The query that `params` holds, already read. */
  query: PlaceAndPeriodQuery;
  nameOf: (nodeId: string) => string;
};

/** Lists the connections recorded near a place or within a period, with where and when each was. */
export function PlacedConnectionList({ params, query, nameOf }: PlacedConnectionListProps) {
  const resource = useApiResource<{ connections: PlacedConnection[] }>(
    `/api/connections?${params}`,
  );

  if (resource.status === "loading") return <p>Loading connections…</p>;
  if (resource.status === "failed") {
    return <p role="alert">Could not load connections: {resource.error.message}</p>;
  }
  if (resource.data.connections.length === 0) {
    return <p className="text-muted">No connections were recorded there and then.</p>;
  }
  return (
    <>
      {resource.data.connections.some(({ date }) => date !== null) && (
        <PeriodTimeline from={query.from} to={query.to} connections={resource.data.connections} />
      )}
      <ul aria-label="Connections by place and period" className="space-y-2">
        {resource.data.connections.map((connection) => (
          <li key={connection.id} className="rounded border border-line px-3 py-2">
            <ConnectionSentence
              sourceId={connection.sourceNodeId}
              relation={connection.relation}
              targetId={connection.targetNodeId}
              nameOf={nameOf}
            />
            <p className="text-sm">{describePlaceAndDate(connection)}</p>
            <ConnectionMeta {...connection} />
          </li>
        ))}
      </ul>
    </>
  );
}

function describePlaceAndDate(connection: PlacedConnection) {
  const { place, latitude, longitude, date, distanceKm } = connection;
  return [
    place ?? "Unnamed place",
    latitude !== null && longitude !== null && `${latitude}, ${longitude}`,
    date,
    distanceKm !== null && `${distanceKm.toFixed(1)} km away`,
  ]
    .filter(Boolean)
    .join(" · ");
}
