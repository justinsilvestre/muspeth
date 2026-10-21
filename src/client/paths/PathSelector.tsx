import clsx from "clsx";
import type { RankedPath } from "../../shared/findPaths";
import type { PathSelection } from "./pathSelection";

type PathSelectorProps = {
  paths: RankedPath[];
  selection: PathSelection;
  onSelect: (selection: PathSelection) => void;
};

/** Lists the paths found, best first, as buttons that select a path. */
export function PathSelector({ paths, selection, onSelect }: PathSelectorProps) {
  return (
    <ol aria-label="Paths" className="flex flex-wrap gap-1.5">
      {paths.map((path, index) => {
        const isSelected = "pathIndex" in selection && selection.pathIndex === index;
        const steps = path.steps.length;
        return (
          <li key={path.nodeIds.join(" ")}>
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
            </button>
          </li>
        );
      })}
    </ol>
  );
}
