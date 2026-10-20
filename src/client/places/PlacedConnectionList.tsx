import type { PlacedConnection } from "../../shared/placeAndPeriodQuery";
import { ConnectionSentence } from "../ConnectionSentence";
import { termLabel } from "../termLabel";
import { useApiResource } from "../useApiResource";

type PlacedConnectionListProps = {
  params: URLSearchParams;
  nameOf: (nodeId: string) => string;
};

/** Lists the connections recorded near a place or within a period, with where and when each was. */
export function PlacedConnectionList({ params, nameOf }: PlacedConnectionListProps) {
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
    <ul aria-label="Connections by place and period" className="space-y-2">
      {resource.data.connections.map((connection) => (
        <li key={connection.id} className="rounded border border-line px-3 py-2">
          <ConnectionSentence
            sourceName={nameOf(connection.sourceNodeId)}
            relation={connection.relation}
            targetName={nameOf(connection.targetNodeId)}
          />
          <p className="text-sm">{describePlaceAndDate(connection)}</p>
          <p className="text-muted text-sm">
            {termLabel(connection.kind)} · {connection.basis} · {connection.source}
            {connection.qualityFlags.length > 0 &&
              ` · flagged: ${connection.qualityFlags.join(", ")}`}
          </p>
        </li>
      ))}
    </ul>
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
