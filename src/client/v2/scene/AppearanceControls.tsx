import type { Appearance } from "./appearance";
import { ColorControls } from "./controls/ColorControls";
import { MaterialControls } from "./controls/MaterialControls";
import { MovementControls } from "./controls/MovementControls";
import { ShapeControls } from "./controls/ShapeControls";

type AppearanceControlsProps = {
  value: Appearance;
  onChange: (value: Appearance) => void;
  onReset: () => void;
};

/** A collapsible panel of compact controls for every adjustable aspect of the cell's appearance. */
export function AppearanceControls({ value, onChange, onReset }: AppearanceControlsProps) {
  const set =
    <Key extends keyof Appearance>(key: Key) =>
    (next: Appearance[Key]) =>
      onChange({ ...value, [key]: next });
  return (
    <details className="rounded border border-line text-sm">
      <summary className="flex cursor-pointer items-center justify-between px-3 py-1.5 text-muted">
        Appearance
        <button type="button" onClick={onReset} className="text-xs underline hover:text-ink">
          Reset
        </button>
      </summary>
      <div className="grid gap-x-6 gap-y-3 px-3 pt-1 pb-3 sm:grid-cols-2 xl:grid-cols-4">
        <ShapeControls value={value.shape} onChange={set("shape")} />
        <MaterialControls value={value.material} onChange={set("material")} />
        <ColorControls value={value.color} onChange={set("color")} />
        <MovementControls value={value.movement} onChange={set("movement")} />
      </div>
    </details>
  );
}
