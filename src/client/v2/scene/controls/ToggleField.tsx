import { useId } from "react";

/** A labelled checkbox for an on-or-off setting. Lays out as one row of a control grid. */
export function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="truncate text-muted">
        {label}
      </label>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="justify-self-start accent-ink"
      />
      <span />
    </>
  );
}
