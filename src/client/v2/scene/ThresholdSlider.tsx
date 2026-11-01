import { SliderField } from "./controls/SliderField";

const greatestThreshold = 12;

/** Sets the subgroupiness display threshold: subgroups with a lower subgroupiness are hidden from the diagram. */
export function ThresholdSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_3.5rem] items-center gap-x-3 text-sm">
      <SliderField
        label="Subgroupiness display threshold"
        value={value}
        min={0}
        max={greatestThreshold}
        step={0.5}
        format={(threshold) => `θ = ${threshold.toFixed(1)}`}
        onChange={onChange}
      />
    </div>
  );
}
