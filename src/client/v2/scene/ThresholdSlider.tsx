import { useId } from "react";

const greatestThreshold = 12;
const step = 0.5;

/** Sets the subgroupiness display threshold: subgroups with a lower subgroupiness are hidden from the diagram. */
export function ThresholdSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-3 text-sm">
      <label htmlFor={id} className="text-muted">
        Subgroupiness display threshold
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={greatestThreshold}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="flex-1 accent-ink"
      />
      <output htmlFor={id} className="w-14 tabular-nums">
        θ = {value.toFixed(1)}
      </output>
    </div>
  );
}
