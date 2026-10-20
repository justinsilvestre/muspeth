import clsx from "clsx";

export type View = "connections" | "taxonomy";

const viewLabels = {
  connections: "Connections",
  taxonomy: "Taxonomic tree",
} satisfies Record<View, string>;

type ViewSwitcherProps = {
  view: View;
  onChange: (view: View) => void;
};

export function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  return (
    <nav aria-label="Views" className="mb-6 flex gap-1 border-line border-b">
      {(Object.keys(viewLabels) as View[]).map((candidate) => (
        <button
          key={candidate}
          type="button"
          aria-pressed={candidate === view}
          onClick={() => onChange(candidate)}
          className={clsx(
            "-mb-px border-b-2 px-3 py-2",
            candidate === view
              ? "border-ink font-medium"
              : "border-transparent text-muted hover:text-ink",
          )}
        >
          {viewLabels[candidate]}
        </button>
      ))}
    </nav>
  );
}
