import { useId } from "react";
import type { BodySet, Sharing } from "./BodySet";
import { relationOf } from "./relations";
import { countMembranes } from "./toSharingTable";

/** Chooses which relation draws the membranes; a relation with nothing recorded among the bodies is listed but cannot be chosen. */
export function RelationSelect({
  set,
  value,
  onChange,
}: {
  set: BodySet;
  value: Sharing;
  onChange: (sharing: Sharing) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 max-w-full items-center gap-3 text-sm">
      <label htmlFor={id} className="text-muted">
        Membranes by
      </label>
      <select
        id={id}
        value={value.relation}
        onChange={(event) =>
          onChange(set.sharings.find((sharing) => sharing.relation === event.target.value) ?? value)
        }
        className="min-w-0 rounded border border-line bg-panel px-2 py-1"
      >
        {set.sharings.map((sharing) => {
          const membranes = countMembranes(set, sharing);
          return (
            <option key={sharing.relation} value={sharing.relation} disabled={membranes === 0}>
              {relationOf(sharing.relation).name}
              {membranes === 0 ? " (none recorded)" : ""}
            </option>
          );
        })}
      </select>
    </div>
  );
}
