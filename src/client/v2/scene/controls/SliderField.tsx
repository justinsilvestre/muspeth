import clsx from "clsx";
import { useId } from "react";

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

/**
 * A labelled slider for a continuous number, showing its current value. Lays out as one row of a control grid.
 * The track and thumb are drawn by the stylesheet rather than the browser, so they look the same in every browser.
 */
export function SliderField({ label, value, min, max, step, onChange, format }: SliderFieldProps) {
  const id = useId();
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return (
    <>
      <label htmlFor={id} className="truncate text-muted">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={clsx(
          "h-4 min-w-0 cursor-pointer appearance-none bg-transparent",
          "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-selected",
          "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-selected",
          "[&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-page [&::-webkit-slider-thumb]:bg-ink",
          "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-page [&::-moz-range-thumb]:bg-ink",
        )}
      />
      <output htmlFor={id} className="text-right tabular-nums">
        {format ? format(value) : value.toFixed(decimals)}
      </output>
    </>
  );
}
