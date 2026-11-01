import { useId } from "react";

type SelectFieldProps<Option extends string> = {
  label: string;
  value: Option;
  options: readonly Option[];
  onChange: (value: Option) => void;
};

/** A labelled dropdown for choosing one of a few named options. Lays out as one row of a control grid. */
export function SelectField<Option extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<Option>) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="truncate text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as Option)}
        className="col-span-2 rounded border border-line bg-panel px-1 py-0.5"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
}
