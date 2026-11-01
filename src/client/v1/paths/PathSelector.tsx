import clsx from "clsx";
import type { PathGroup } from "./groupPathVariants";
import type { PathSelection } from "./pathSelection";

type PathSelectorProps = {
  groups: PathGroup[];
  selection: PathSelection;
  onSelect: (selection: PathSelection) => void;
};

/** Lists the paths found, best first, as buttons that select a path, counting the variants of each. */
export function PathSelector({ groups, selection, onSelect }: PathSelectorProps) {
  return (
    <ol aria-label="Paths" className="flex flex-wrap gap-1.5">
      {groups.map(({ paths }, index) => {
        const isSelected = "pathIndex" in selection && selection.pathIndex === index;
        const steps = paths[0]?.steps.length ?? 0;
        return (
          <li key={paths[0]?.nodeIds.join(" ")}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect({ pathIndex: index })}
              className={clsx(
                "rounded border px-2.5 py-1 text-sm focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-1",
                isSelected ? "border-ink bg-selected" : "border-line text-muted hover:bg-subtle",
              )}
            >
              Path {index + 1} · {steps} {steps === 1 ? "step" : "steps"}
              {paths.length > 1 && ` · ${paths.length} variants`}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
