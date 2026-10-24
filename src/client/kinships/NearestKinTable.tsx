import { type Kinships, kinshipGroupings } from "../../shared/kinships/kinships";
import { listNearestKin } from "../../shared/kinships/listNearestKin";
import { NodeLink } from "../NodeLink";
import { GroupingName } from "./GroupingName";

type NearestKinTableProps = {
  kinships: Kinships;
  selectedId: string;
  nameOf: (nodeId: string) => string;
  onSelect: (id: string) => void;
};

/** Lists, under each grouping, the organisms closest to the chosen one. */
export function NearestKinTable({ kinships, selectedId, nameOf, onSelect }: NearestKinTableProps) {
  const ids = kinships.organisms.map(({ id }) => id);
  const sortedOrganisms = [...kinships.organisms].sort((a, b) =>
    nameOf(a.id).localeCompare(nameOf(b.id)),
  );

  return (
    <section aria-labelledby="nearest-kin-heading" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="nearest-kin-heading" className="font-medium">
          Closest kin of
        </h3>
        <label htmlFor="kinship-organism" className="sr-only">
          Organism
        </label>
        <select
          id="kinship-organism"
          value={selectedId}
          onChange={(event) => onSelect(event.target.value)}
          className="rounded border border-line bg-page px-2 py-1.5 text-sm"
        >
          {sortedOrganisms.map(({ id }) => (
            <option key={id} value={id}>
              {nameOf(id)}
            </option>
          ))}
        </select>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {kinshipGroupings.map((grouping) => {
          const kin = listNearestKin(ids, kinships.distances[grouping], selectedId, 3);
          return (
            <div key={grouping} className="space-y-1 rounded border border-line bg-panel p-3">
              <dt className="font-medium">
                <GroupingName grouping={grouping} />
              </dt>
              {kin.length === 0 && (
                <dd className="text-muted">Shares nothing with the others here.</dd>
              )}
              {kin.map(({ id, distance }) => (
                <dd key={id} className="flex justify-between gap-2">
                  <NodeLink nodeId={id} name={nameOf(id)} />
                  <span className="text-muted tabular-nums">
                    {Math.round((1 - distance) * 100)}% shared
                  </span>
                </dd>
              ))}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
