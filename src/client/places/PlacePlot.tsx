import type { Coordinates, PlacedConnection } from "../../shared/placeAndPeriodQuery";
import { KindDot } from "../graphics/KindDot";
import { termLabel } from "../termLabel";
import { formatLatitude, formatLongitude, listGraticule } from "./listGraticule";
import { choosePlotView, measurePlotHeight, projectPoint, projectRadius } from "./placePlotView";

const width = 400;

type PlacePlotProps = {
  near: Coordinates | null;
  radiusKm: number;
  connections: PlacedConnection[];
};

/** Plots where connections were recorded, about the searched place and its radius or on the whole world. */
export function PlacePlot({ near, radiusKm, connections }: PlacePlotProps) {
  const view = choosePlotView(near, radiusKm);
  const height = measurePlotHeight(view, width);
  const { latitudes, longitudes } = listGraticule(view);
  const placed = connections.filter(hasCoordinates);
  return (
    <svg
      role="img"
      aria-labelledby="place-plot-title place-plot-desc"
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full max-w-sm text-[11px]"
    >
      <title id="place-plot-title">Map of where the connections were recorded</title>
      <desc id="place-plot-desc">{describePlot(placed.length, near, radiusKm)}</desc>
      <rect width={width} height={height} className="fill-panel stroke-line" />
      {latitudes.map((latitude) => {
        const { y } = projectPoint(view, { latitude, longitude: view.west }, width);
        return (
          <g key={`latitude ${latitude}`}>
            <line x1={0} x2={width} y1={y} y2={y} className="stroke-line" />
            <text x={4} y={y - 3} className="fill-faint">
              {formatLatitude(latitude)}
            </text>
          </g>
        );
      })}
      {longitudes.map((longitude) => {
        const { x } = projectPoint(view, { latitude: view.south, longitude }, width);
        return (
          <g key={`longitude ${longitude}`}>
            <line x1={x} x2={x} y1={0} y2={height} className="stroke-line" />
            <text x={x + 3} y={height - 4} className="fill-faint">
              {formatLongitude(longitude)}
            </text>
          </g>
        );
      })}
      {near && <SearchArea near={near} radiusKm={radiusKm} view={view} />}
      {placed.map((connection) => (
        <KindDot
          key={connection.id}
          at={projectPoint(view, connection, width)}
          kind={connection.kind}
        >
          <title>{`${connection.place ?? "Unnamed place"}: ${termLabel(connection.kind)}`}</title>
        </KindDot>
      ))}
    </svg>
  );
}

function SearchArea({
  near,
  radiusKm,
  view,
}: {
  near: Coordinates;
  radiusKm: number;
  view: ReturnType<typeof choosePlotView>;
}) {
  const centre = projectPoint(view, near, width);
  const { rx, ry } = projectRadius(view, near, radiusKm, width);
  return (
    <g>
      <ellipse
        cx={centre.x}
        cy={centre.y}
        rx={rx}
        ry={ry}
        strokeDasharray="4 3"
        className="fill-subtle/60 stroke-muted"
      />
      <path
        d={`M ${centre.x - 6} ${centre.y} h 12 M ${centre.x} ${centre.y - 6} v 12`}
        className="stroke-2 stroke-ink"
      />
    </g>
  );
}

function hasCoordinates(
  connection: PlacedConnection,
): connection is PlacedConnection & Coordinates {
  return connection.latitude !== null && connection.longitude !== null;
}

function describePlot(count: number, near: Coordinates | null, radiusKm: number) {
  const dots = `${count} ${count === 1 ? "connection" : "connections"} plotted`;
  if (!near) return `${dots} on a map of the world.`;
  return `${dots} within ${radiusKm} km of ${formatLatitude(near.latitude)}, ${formatLongitude(near.longitude)}.`;
}
