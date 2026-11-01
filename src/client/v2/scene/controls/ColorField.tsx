/** A labelled color picker. Lays out as one row of a control grid. */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="contents">
      <span className="truncate text-muted">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-5 w-full cursor-pointer rounded border border-line bg-transparent"
      />
      <output className="text-right font-mono text-xs uppercase">{value.slice(1)}</output>
    </label>
  );
}
