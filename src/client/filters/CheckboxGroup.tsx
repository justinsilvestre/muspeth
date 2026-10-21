import { termLabel } from "../termLabel";

type CheckboxGroupProps<Term extends string> = {
  legend: string;
  terms: readonly Term[];
  checkedTerms: Term[];
  /** Words for displaying a term; defaults to the term with its underscores replaced by spaces. */
  labelOf?: (term: Term) => string;
  onChange: (checkedTerms: Term[]) => void;
};

/** Lets the reader check any number of terms; checking none puts no limit on the field. */
export function CheckboxGroup<Term extends string>({
  legend,
  terms,
  checkedTerms,
  labelOf = termLabel,
  onChange,
}: CheckboxGroupProps<Term>) {
  const toggle = (term: Term, isChecked: boolean) =>
    onChange(isChecked ? [...checkedTerms, term] : checkedTerms.filter((t) => t !== term));

  return (
    <fieldset>
      <legend className="mb-1 font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {terms.map((term) => (
          <label key={term} className="flex items-center gap-1.5">
            <input
              type="checkbox"
              className="accent-ink"
              checked={checkedTerms.includes(term)}
              onChange={(event) => toggle(term, event.target.checked)}
            />
            {labelOf(term)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
