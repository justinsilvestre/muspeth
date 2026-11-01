import { type KeyboardEvent, useId, useReducer } from "react";
import { nodeDisplayName } from "../nodeDisplayName";
import type { NodeCatalog } from "./createNodeCatalog";
import { describeMatchCount } from "./describeMatchCount";
import { findShownMatches } from "./findShownMatches";
import { KindBadge } from "./KindBadge";
import { NodeOptionList, nodeOptionId } from "./NodeOptionList";
import { NodeDetailLine } from "./NodeSummary";
import { closedComboboxState, nodeComboboxReducer } from "./nodeComboboxReducer";
import { SearchInput } from "./SearchInput";

type NodeComboboxProps = {
  label: string;
  catalog: NodeCatalog;
  /** The chosen node's ID, or an empty string when none is chosen. */
  selectedNodeId: string;
  onChange: (nodeId: string) => void;
};

/** What each handled key does: move the active option by an offset, choose it, or close the list. */
const keyActions: Partial<Record<string, number | "choose" | "escape">> = {
  ArrowDown: 1,
  ArrowUp: -1,
  PageDown: 10,
  PageUp: -10,
  Enter: "choose",
  Escape: "escape",
};

/** Lets the reader choose one node by typing any of its names. */
export function NodeCombobox({ label, catalog, selectedNodeId, onChange }: NodeComboboxProps) {
  const id = useId();
  const [state, dispatch] = useReducer(nodeComboboxReducer, closedComboboxState);
  const selectedNode = catalog.nodesById.get(selectedNodeId);
  const { matches, totalCount } = findShownMatches(catalog, state.query ?? "");
  const countText = totalCount === undefined ? "" : describeMatchCount(matches.length, totalCount);
  const activeMatch = state.isOpen ? matches[state.activeIndex] : undefined;
  const choose = (index: number) => {
    const match = matches[index];
    if (match) onChange(match.node.id);
    dispatch({ type: "chosen" });
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    const action = keyActions[event.key];
    if (action === undefined) return;
    event.preventDefault();
    if (action === "choose") return activeMatch && choose(state.activeIndex);
    if (action === "escape") return dispatch({ type: "escaped" });
    dispatch({ type: "movedBy", offset: action, optionCount: matches.length });
  };

  return (
    <div className="relative flex min-w-0 flex-col gap-1 text-sm">
      <label htmlFor={`${id}-input`} className="font-medium">
        {label}
      </label>
      <SearchInput
        id={`${id}-input`}
        role="combobox"
        aria-expanded={state.isOpen}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={activeMatch && nodeOptionId(`${id}-listbox`, state.activeIndex)}
        placeholder="Type a name…"
        value={state.query ?? (selectedNode ? nodeDisplayName(selectedNode, "en") : "")}
        onChange={(event) => dispatch({ type: "typed", query: event.target.value })}
        onKeyDown={handleKeyDown}
        onFocus={(event) => event.target.select()}
        onClick={() => dispatch({ type: "opened" })}
        onBlur={() => dispatch({ type: "left" })}
      />
      {selectedNode && state.query === null && (
        <span className="flex min-w-0 items-baseline gap-2">
          <KindBadge kind={selectedNode.kind} />
          <NodeDetailLine
            node={selectedNode}
            isNameShared={catalog.sharedNameNodeIds.has(selectedNode.id)}
          />
        </span>
      )}
      <p role="status" className="sr-only">
        {state.isOpen && countText}
      </p>
      {state.isOpen && (
        // Keeps the focus in the field when an option is pressed, so that the click can choose it.
        // biome-ignore lint/a11y/noStaticElementInteractions: the wrapper only stops the field losing focus.
        <div
          className="absolute top-full right-0 left-0 z-10 mt-1 rounded border border-line bg-page shadow-lg"
          onMouseDown={(event) => event.preventDefault()}
        >
          <NodeOptionList
            id={`${id}-listbox`}
            matches={matches}
            catalog={catalog}
            activeIndex={state.activeIndex}
            onActivate={(index) => dispatch({ type: "activated", index })}
            onChoose={choose}
          />
          <p className="border-line border-t px-3 py-1.5 text-muted">
            {totalCount === undefined
              ? "Type to search every name, or start from one of these."
              : countText}
          </p>
        </div>
      )}
    </div>
  );
}
