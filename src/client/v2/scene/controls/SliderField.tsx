type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** How to show the value beside the slider; by default, with as many decimals as the step has. */
  format?: (value: number) => string;
};

/** A labelled slider for a continuous number, showing its current value. Lays out as one row of a control grid. */
export function SliderField({ label, value, min, max, step, onChange, format }: SliderFieldProps) {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return (
    <label className="contents">
      <span className="truncate text-muted">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-w-0 accent-ink"
      />
      <output className="text-right tabular-nums">
        {format ? format(value) : value.toFixed(decimals)}
      </output>
    </label>
  );
}
