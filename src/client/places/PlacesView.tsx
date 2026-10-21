import { useSearchParams } from "react-router";
import type { GraphNode } from "../../shared/graph";
import {
  parseOptionalPlaceAndPeriodQuery,
  parsePlaceAndPeriodQuery,
} from "../../shared/placeAndPeriodQuery";
import { createNodeNamer } from "../createNodeNamer";
import { ConnectionFilterControls } from "../filters/ConnectionFilterControls";
import { useConnectionFilter } from "../filters/useConnectionFilter";
import { PlacedConnectionList } from "./PlacedConnectionList";
import { PlaceQueryForm } from "./PlaceQueryForm";
import { PlacesExplorer } from "./PlacesExplorer";
import { PlacesIntro } from "./PlacesIntro";

/** Finds the connections recorded near a place, within a period, or both. */
export function PlacesView({ nodes }: { nodes: GraphNode[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterResult, setFilter } = useConnectionFilter();
  const queryResult = parsePlaceAndPeriodQuery(searchParams);
  const exploredResult = parseOptionalPlaceAndPeriodQuery(searchParams);
  const hasQuery = ["near", "from", "to"].some((name) => searchParams.has(name));
  // Resets the form's fields when the address changes them, but not when only the filter changes.
  const formKey = ["near", "radiusKm", "from", "to"]
    .map((name) => searchParams.get(name))
    .join(" ");

  return (
    <section aria-labelledby="places-heading" className="space-y-4">
      <h2 id="places-heading" className="font-medium text-lg">
        Connections by place and period
      </h2>
      <PlaceQueryForm key={formKey} params={searchParams} onSubmit={setSearchParams} />
      {filterResult.ok && (
        <ConnectionFilterControls filter={filterResult.value} onChange={setFilter} />
      )}
      {hasQuery && !queryResult.ok && <p role="alert">{queryResult.error}</p>}
      {exploredResult.ok && (
        <PlacesExplorer
          params={searchParams}
          query={exploredResult.value}
          onSearch={setSearchParams}
        />
      )}
      {!hasQuery && <PlacesIntro />}
      {queryResult.ok && (
        <PlacedConnectionList
          params={searchParams}
          query={queryResult.value}
          nameOf={createNodeNamer(nodes)}
        />
      )}
    </section>
  );
}
