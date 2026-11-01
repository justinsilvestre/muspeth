import clsx from "clsx";
import { useEffect, useRef } from "react";
import type { NodeCatalog } from "./createNodeCatalog";
import { NodeSummary } from "./NodeSummary";
import type { NodeMatch } from "./searchNodes";

type NodeOptionListProps = {
  id: string;
  matches: NodeMatch[];
  catalog: NodeCatalog;
  activeIndex: number;
  onActivate: (index: number) => void;
  onChoose: (index: number) => void;
};

/** Returns the element ID of an option in a node combobox's list. */
export function nodeOptionId(listboxId: string, index: number) {
  return `${listboxId}-option-${index}`;
}

/** Lists a node combobox's options, keeping the active one in view. */
export function NodeOptionList({
  id,
  matches,
  catalog,
  activeIndex,
  ...handlers
}: NodeOptionListProps) {
  const listboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listboxRef.current?.children[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div ref={listboxRef} id={id} role="listbox" className="max-h-72 overflow-y-auto">
      {matches.map(({ node, matchedName }, index) => (
        // biome-ignore lint/a11y/useFocusableInteractive: the combobox field keeps the focus and marks the active option.
        // biome-ignore lint/a11y/useKeyWithClickEvents: the combobox field handles the keyboard.
        <div
          key={node.id}
          id={nodeOptionId(id, index)}
          role="option"
          aria-selected={index === activeIndex}
          className={clsx("cursor-pointer px-3 py-2", index === activeIndex && "bg-selected")}
          onMouseMove={() => index !== activeIndex && handlers.onActivate(index)}
          onClick={() => handlers.onChoose(index)}
        >
          <NodeSummary
            node={node}
            isNameShared={catalog.sharedNameNodeIds.has(node.id)}
            matchedName={matchedName}
          />
        </div>
      ))}
    </div>
  );
}
