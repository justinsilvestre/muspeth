import { useId } from "react";
import { networks } from "./networks";
import type { NetworkChoice } from "./PollinationNetwork";

/** Chooses which network the scene draws. */
export function NetworkSelect({
  value,
  onChange,
}: {
  value: NetworkChoice;
  onChange: (network: NetworkChoice) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-3 text-sm">
      <label htmlFor={id} className="text-muted">
        Site
      </label>
      <select
        id={id}
        value={value.id}
        onChange={(event) =>
          onChange(networks.find((network) => network.id === event.target.value) ?? value)
        }
        className="rounded border border-line bg-panel px-2 py-1"
      >
        {networks.map((network) => (
          <option key={network.id} value={network.id}>
            {network.name}
          </option>
        ))}
      </select>
    </div>
  );
}
