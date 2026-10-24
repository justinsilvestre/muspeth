import { useSearchParams } from "react-router";
import type { GraphNode } from "../../shared/graph";
import {
  type KinshipGrouping,
  type Kinships,
  kinshipGroupings,
} from "../../shared/kinships/kinships";
import { precomputedResponsePaths } from "../../shared/precomputedResponsePaths";
import { createNodeNamer } from "../createNodeNamer";
import { useApiResource } from "../useApiResource";
import { AgreementMatrix } from "./AgreementMatrix";
import { groupingLabel } from "./groupingLabel";
import { NearestKinTable } from "./NearestKinTable";
import { Tanglegram } from "./Tanglegram";

const defaultComparison = "interaction";
const defaultOrganismId = "wikidata:Q509308";

/** Groups the same organisms by descent and by each kind of connection, and compares the groupings. */
export function KinshipsView({ nodes }: { nodes: GraphNode[] }) {
  const resource = useApiResource<Kinships>(precomputedResponsePaths["/api/kinships"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const nameOf = createNodeNamer(nodes);
  const setParameter = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(name, value);
    setSearchParams(next);
  };

  return (
    <section aria-labelledby="kinships-heading" className="space-y-6">
      <div className="space-y-2">
        <h2 id="kinships-heading" className="font-medium text-lg">
          Same organisms, several trees
        </h2>
        <p className="max-w-prose text-muted text-sm">
          The same organisms, grouped once by descent and once by each kind of connection. Two
          organisms are close in a kind when they share many neighbours through it: the same
          pollinators, compounds, artworks, words or places. Biologists themselves use many species
          concepts, each answering a different question. Each tree here answers a different one too.
        </p>
      </div>
      {resource.status === "loading" && <p>Loading kinships…</p>}
      {resource.status === "failed" && (
        <p role="alert">Could not load kinships: {resource.error.message}</p>
      )}
      {resource.status === "loaded" && (
        <KinshipsContent
          kinships={resource.data}
          comparison={readGrouping(searchParams.get("compare"))}
          selectedId={readOrganism(resource.data, searchParams.get("organism"))}
          nameOf={nameOf}
          onChange={setParameter}
        />
      )}
    </section>
  );
}

type KinshipsContentProps = {
  kinships: Kinships;
  comparison: KinshipGrouping;
  selectedId: string;
  nameOf: (nodeId: string) => string;
  onChange: (name: "compare" | "organism", value: string) => void;
};

function KinshipsContent({
  kinships,
  comparison,
  selectedId,
  nameOf,
  onChange,
}: KinshipsContentProps) {
  return (
    <>
      <div className="space-y-3">
        <label htmlFor="kinship-compare" className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Compare descent with</span>
          <select
            id="kinship-compare"
            value={comparison}
            onChange={(event) => onChange("compare", event.target.value)}
            className="rounded border border-line bg-page px-2 py-1.5"
          >
            {kinshipGroupings
              .filter((grouping) => grouping !== "descent")
              .map((grouping) => (
                <option key={grouping} value={grouping}>
                  {groupingLabel(grouping)}
                </option>
              ))}
          </select>
        </label>
        <Tanglegram
          kinships={kinships}
          comparison={comparison}
          selectedId={selectedId}
          nameOf={nameOf}
        />
      </div>
      <NearestKinTable
        kinships={kinships}
        selectedId={selectedId}
        nameOf={nameOf}
        onSelect={(id) => onChange("organism", id)}
      />
      <AgreementMatrix kinships={kinships} />
    </>
  );
}

function readGrouping(value: string | null) {
  const grouping = kinshipGroupings.find((candidate) => candidate === value);
  return grouping && grouping !== "descent" ? grouping : defaultComparison;
}

function readOrganism(kinships: Kinships, value: string | null) {
  const ids = kinships.organisms.map(({ id }) => id);
  return [value, defaultOrganismId].find((id) => id && ids.includes(id)) ?? ids[0] ?? "";
}
