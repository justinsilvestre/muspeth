import { useId } from "react";
import { type NodeKind, nodeKinds } from "../../shared/graph";
import { nodeKindLabels } from "./nodeKindLabels";
import { SearchInput } from "./SearchInput";

type NodeSearchFieldsProps = {
  query: string;
  kind: NodeKind | undefined;
  onQueryChange: (query: string) => void;
  onKindChange: (kind: NodeKind | undefined) => void;
};

export function NodeSearchFields({
  query,
  kind,
  onQueryChange,
  onKindChange,
}: NodeSearchFieldsProps) {
  const id = useId();

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <label htmlFor={`${id}-query`} className="font-medium">
          Search nodes
        </label>
        <SearchInput
          id={`${id}-query`}
          type="search"
          placeholder="matsutake, マツ, Pinus…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-kind`} className="font-medium">
          Kind
        </label>
        <select
          id={`${id}-kind`}
          className="rounded border border-line bg-page px-2 py-1.5 text-base focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-1"
          value={kind ?? ""}
          onChange={(event) => onKindChange(readKind(event.target.value))}
        >
          <option value="">All kinds</option>
          {nodeKinds.map((nodeKind) => (
            <option key={nodeKind} value={nodeKind}>
              {nodeKindLabels[nodeKind]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function readKind(value: string) {
  return nodeKinds.find((nodeKind) => nodeKind === value);
}
