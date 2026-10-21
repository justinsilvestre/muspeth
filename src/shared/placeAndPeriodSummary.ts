import type { ConnectionKind } from "./graph";
import type { Coordinates } from "./placeAndPeriodQuery";

/** How many connections of one kind were recorded at one place. */
export type PlaceSummary = Coordinates & {
  place: string | null;
  kind: ConnectionKind;
  count: number;
};

/** How many connections of one kind were recorded on one date, which may be an interval such as "1990/1992". */
export type DateSummary = {
  date: string;
  kind: ConnectionKind;
  count: number;
};
