import { useId } from "react";
import { families, type LanguageFamily } from "../glottometry/families";

/** Chooses which family the scene draws. */
export function FamilySelect({
  value,
  onChange,
}: {
  value: LanguageFamily;
  onChange: (family: LanguageFamily) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-3 text-sm">
      <label htmlFor={id} className="text-muted">
        Family
      </label>
      <select
        id={id}
        value={value.id}
        onChange={(event) =>
          onChange(families.find((family) => family.id === event.target.value) ?? value)
        }
        className="rounded border border-line bg-panel px-2 py-1"
      >
        {families.map((family) => (
          <option key={family.id} value={family.id}>
            {family.name}
          </option>
        ))}
      </select>
    </div>
  );
}
