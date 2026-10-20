import { type ConnectionFilter, emptyConnectionFilter } from "../../shared/connectionFilter";
import { connectionBases, connectionKinds } from "../../shared/graph";
import { useApiResource } from "../useApiResource";
import { CheckboxGroup } from "./CheckboxGroup";
import { QualityFlagChoices } from "./QualityFlagChoices";

type ConnectionFilterControlsProps = {
  filter: ConnectionFilter;
  onChange: (filter: ConnectionFilter) => void;
};

/** Lets the reader narrow connections by kind, basis, source and quality flag. */
export function ConnectionFilterControls({ filter, onChange }: ConnectionFilterControlsProps) {
  const sourcesResource = useApiResource<{ sources: string[] }>("/api/sources");
  const sources = sourcesResource.status === "loaded" ? sourcesResource.data.sources : [];
  const activeCount = Object.values(filter).reduce((count, values) => count + values.length, 0);

  return (
    <details className="mb-4 rounded border border-line bg-panel px-3 py-2 text-sm">
      <summary className="cursor-pointer font-medium">
        Filters{activeCount > 0 && ` (${activeCount})`}
      </summary>
      <div className="mt-2 space-y-3">
        <CheckboxGroup
          legend="Kinds"
          terms={connectionKinds}
          checkedTerms={filter.kinds}
          onChange={(kinds) => onChange({ ...filter, kinds })}
        />
        <CheckboxGroup
          legend="Bases"
          terms={connectionBases}
          checkedTerms={filter.bases}
          onChange={(bases) => onChange({ ...filter, bases })}
        />
        <CheckboxGroup
          legend="Imported from"
          terms={sources}
          checkedTerms={filter.sources}
          onChange={(checked) => onChange({ ...filter, sources: checked })}
        />
        <QualityFlagChoices filter={filter} onChange={onChange} />
        {activeCount > 0 && (
          <button
            type="button"
            className="underline"
            onClick={() => onChange(emptyConnectionFilter)}
          >
            Clear filters
          </button>
        )}
      </div>
    </details>
  );
}
