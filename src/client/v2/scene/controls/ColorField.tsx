import { useId } from "react";

/** A labelled color picker, shown as a swatch of the current color. Lays out as one row of a control grid. */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="truncate text-muted">
        {label}
      </label>
      <span
        className="relative h-5 w-full rounded border border-line"
        style={{ background: value }}
      >
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </span>
      <output htmlFor={id} className="text-right font-mono text-xs uppercase">
        {value.slice(1)}
      </output>
    </>
  );
}
