import { useId } from "react";
import type { Side } from "./PollinationNetwork";

const sides = [
  { side: "plants", label: "Plants" },
  { side: "visitors", label: "Visitors" },
] satisfies { side: Side; label: string }[];

/** Chooses which side of the network the scene draws as bodies; the other side forms the membranes. */
export function SideSwitch({ value, onChange }: { value: Side; onChange: (side: Side) => void }) {
  const name = useId();
  return (
    <fieldset className="flex items-center gap-3 text-sm">
      <legend className="float-left text-muted">Bodies</legend>
      {sides.map(({ side, label }) => (
        <label key={side} className="flex items-center gap-1">
          <input
            type="radio"
            name={name}
            value={side}
            checked={value === side}
            onChange={() => onChange(side)}
            className="accent-ink"
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
