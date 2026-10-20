import clsx from "clsx";
import type { ActionDispatch } from "react";
import { type BarkMaterial, barkMaterials } from "./barkMaterials";
import type { GraphicsSettings, graphicsSettingsReducer } from "./graphicsSettings";

type GraphicsPanelProps = {
  settings: GraphicsSettings;
  dispatch: ActionDispatch<[Parameters<typeof graphicsSettingsReducer>[1]]>;
};

/** A collapsible panel for adjusting how the tree is drawn. */
export function GraphicsPanel({ settings, dispatch }: GraphicsPanelProps) {
  const change = (changes: Partial<GraphicsSettings>) => dispatch({ type: "changed", changes });

  return (
    <details className="absolute top-2 right-2 w-64 rounded border border-line bg-page/90 text-sm backdrop-blur">
      <summary className="cursor-pointer px-3 py-1.5">Graphics</summary>
      <div className="space-y-3 px-3 pb-3">
        <fieldset>
          <legend className="mb-1 text-muted text-xs">Branches</legend>
          <div className="grid grid-cols-3 gap-1">
            {barkMaterials.map((material) => (
              <MaterialSwatch
                key={material.id}
                material={material}
                isSelected={material.id === settings.barkMaterialId}
                onSelect={() => change({ barkMaterialId: material.id })}
              />
            ))}
          </div>
        </fieldset>
        <RangeSetting
          label="Trunk thickness"
          range={[0.1, 0.6, 0.01]}
          value={settings.trunkRadius}
          onChange={(trunkRadius) => change({ trunkRadius })}
        />
        <RangeSetting
          label="Thickness kept per rank"
          range={[0.5, 0.95, 0.01]}
          value={settings.taperPerRank}
          onChange={(taperPerRank) => change({ taperPerRank })}
        />
        <RangeSetting
          label="Leaf size"
          range={[0.3, 2.5, 0.1]}
          value={settings.leafSize}
          onChange={(leafSize) => change({ leafSize })}
        />
        <RangeSetting
          label="Leaf gap"
          range={[0, 0.3, 0.01]}
          value={settings.leafGap}
          onChange={(leafGap) => change({ leafGap })}
        />
        <button
          type="button"
          onClick={() => dispatch({ type: "reset" })}
          className="text-muted text-xs underline hover:text-ink"
        >
          Reset to defaults
        </button>
      </div>
    </details>
  );
}

function MaterialSwatch(props: {
  material: BarkMaterial;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { material, isSelected, onSelect } = props;
  const shine = material.metalness > 0.5 || material.roughness < 0.3 ? "white 75%" : "white 35%";

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={clsx(
        "flex flex-col items-center gap-1 rounded border px-1 py-1.5 text-xs",
        isSelected ? "border-ink" : "border-transparent hover:border-line",
      )}
    >
      <span
        aria-hidden="true"
        className="size-6 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${material.color}, ${shine}), ${material.color} 45%, color-mix(in oklab, ${material.color}, black 45%))`,
          opacity: "opacity" in material ? 0.6 : 1,
        }}
      />
      {material.label}
    </button>
  );
}

function RangeSetting(props: {
  label: string;
  range: [min: number, max: number, step: number];
  value: number;
  onChange: (value: number) => void;
}) {
  const { label, range, value, onChange } = props;
  const [min, max, step] = range;

  return (
    <label className="block">
      <span className="flex justify-between text-muted text-xs">
        {label}
        <output>{value.toFixed(2)}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-stone-500"
      />
    </label>
  );
}
