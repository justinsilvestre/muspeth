import { useId } from "react";
import { type BodySet, bodySets, groupBodySets } from "./bodySets";

/** Chooses which set of bodies the scene draws, listed under the heading of each group. */
export function BodySetSelect({
  value,
  onChange,
}: {
  value: BodySet;
  onChange: (set: BodySet) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 max-w-full items-center gap-3 text-sm">
      <label htmlFor={id} className="text-muted">
        Bodies
      </label>
      <select
        id={id}
        value={value.id}
        onChange={(event) =>
          onChange(bodySets.find((set) => set.id === event.target.value) ?? value)
        }
        className="min-w-0 rounded border border-line bg-panel px-2 py-1"
      >
        {groupBodySets(bodySets).map(([group, sets]) => (
          <optgroup key={group} label={group}>
            {sets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
