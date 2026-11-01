import { useId } from "react";
import { type BodySet, bodySets, groupBodySets } from "./bodySets";

/** Chooses which dots the scene draws, as the first blank of the sentence "Show … grouped by …". */
export function BodySetSelect({
  value,
  onChange,
}: {
  value: BodySet;
  onChange: (set: BodySet) => void;
}) {
  const id = useId();
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2">
      <label htmlFor={id} className="whitespace-nowrap">
        Show
      </label>
      <select
        id={id}
        value={value.id}
        onChange={(event) =>
          onChange(bodySets.find((set) => set.id === event.target.value) ?? value)
        }
        className="min-w-0 rounded border border-line bg-panel px-2 py-1 font-medium"
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
    </span>
  );
}
