import type { ConnectionKind } from "./graph";
import type { Coordinates } from "./placeAndPeriodQuery";

/** How many connections of one kind were recorded at one place. */
export type PlaceSummary = Coordinates & {
  place: string | null;
  kind: ConnectionKind;
  count: number;
};
