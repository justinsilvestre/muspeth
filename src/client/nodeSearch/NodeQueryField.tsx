import { useId } from "react";
import { SearchInput } from "./SearchInput";

type NodeQueryFieldProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

/** Takes the text to search the nodes for. */
export function NodeQueryField({ query, onQueryChange }: NodeQueryFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={id} className="font-medium">
        Search nodes
      </label>
      <SearchInput
        id={id}
        type="search"
        placeholder="matsutake, マツ, Pinus…"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </div>
  );
}
