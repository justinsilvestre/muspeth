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
  return (
    <label className="contents">
      <span className="truncate text-muted">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="justify-self-start accent-ink"
      />
      <span />
    </label>
  );
}
