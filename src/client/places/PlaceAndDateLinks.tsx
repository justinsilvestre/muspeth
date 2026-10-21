import { Fragment } from "react";
import { Link } from "react-router";
import type { PlacedConnection } from "../../shared/placeAndPeriodQuery";
import { hopToDate, hopToPlace } from "./placeSearchParams";

type PlaceAndDateLinksProps = {
  connection: PlacedConnection;
  /** The address's query, which each link starts from. */
  params: URLSearchParams;
};

/** States where and when a connection was recorded, linking its place and its date to searches of their own. */
export function PlaceAndDateLinks({ connection, params }: PlaceAndDateLinksProps) {
  const { place, latitude, longitude, date, distanceKm } = connection;
  const placeName = place ?? "Unnamed place";
  const placeParams =
    latitude !== null && longitude !== null && hopToPlace(params, { latitude, longitude });
  const dateParams = date && hopToDate(params, date);
  const parts = [
    placeParams ? (
      <HopLink key="place" params={placeParams} label={`Search near ${placeName} at any time`}>
        {placeName}
      </HopLink>
    ) : (
      placeName
    ),
    latitude !== null && longitude !== null && `${latitude}, ${longitude}`,
    dateParams ? (
      <HopLink key="date" params={dateParams} label={`Search ${date} anywhere`}>
        {date}
      </HopLink>
    ) : (
      date
    ),
    distanceKm !== null && `${distanceKm.toFixed(1)} km away`,
  ].filter(Boolean);
  return (
    <p className="text-sm">
      {parts.map((part, index) => (
        // The parts keep their order, so their positions identify them.
        // biome-ignore lint/suspicious/noArrayIndexKey: see above
        <Fragment key={index}>
          {index > 0 && " · "}
          {part}
        </Fragment>
      ))}
    </p>
  );
}

type HopLinkProps = { params: URLSearchParams; label: string; children: string };

function HopLink({ params, label, children }: HopLinkProps) {
  return (
    <Link
      to={`/places?${params}`}
      title={label}
      aria-label={label}
      className="underline decoration-faint underline-offset-2 hover:decoration-ink"
    >
      {children}
    </Link>
  );
}
