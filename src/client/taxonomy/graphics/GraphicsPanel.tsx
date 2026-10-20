import clsx from "clsx";
import type { ActionDispatch } from "react";
import { type BarkMaterial, barkMaterials } from "./barkMaterials";
import type { GraphicsSettings, graphicsSettingsReducer } from "./graphicsSettings";
import { shadingStyles } from "./shadingStyles";

type GraphicsPanelProps = {
  settings: GraphicsSettings;
  dispatch: ActionDispatch<[Parameters<typeof graphicsSettingsReducer>[1]]>;
  /** Shows changes on the tree without keeping them, or stops showing them when given null. */
  onPreview: (changes: Partial<GraphicsSettings> | null) => void;
};

/** A collapsible panel for adjusting how the tree is drawn. */
export function GraphicsPanel({ settings, dispatch, onPreview }: GraphicsPanelProps) {
  const change = (changes: Partial<GraphicsSettings>) => dispatch({ type: "changed", changes });
  /** Previews the changes while the pointer or keyboard focus rests on an option. */
  const previewOn = (changes: Partial<GraphicsSettings>) => ({
    onPointerEnter: () => onPreview(changes),
    onPointerLeave: () => onPreview(null),
    onFocus: () => onPreview(changes),
    onBlur: () => onPreview(null),
  });

  return (
    <details className="absolute right-2 bottom-2 max-h-[calc(100%-1rem)] w-64 overflow-y-auto rounded border border-line bg-page/90 text-sm backdrop-blur">
      <summary className="cursor-pointer px-3 py-1.5">Graphics</summary>
      <div className="space-y-3 px-3 pb-3">
        <fieldset>
          <legend className="mb-1 text-muted text-xs">Branches</legend>
          <div className="grid grid-cols-11">
            {barkMaterials.map((material) => (
              <MaterialSwatch
                key={material.id}
                material={material}
                isSelected={material.id === settings.barkMaterialId}
                onSelect={() => change({ barkMaterialId: material.id })}
                previewHandlers={previewOn({ barkMaterialId: material.id })}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-muted text-xs">Shading</legend>
          <div className="grid grid-cols-3 gap-1">
            {shadingStyles.map((style) => (
              <button
                key={style.id}
                type="button"
                title={style.description}
                aria-pressed={style.id === settings.shading}
                onClick={() => change({ shading: style.id })}
                {...previewOn({ shading: style.id })}
                className={clsx(
                  "rounded border px-1 py-1 text-xs",
                  style.id === settings.shading ? "border-ink" : "border-line hover:border-muted",
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="space-y-0.5">
          <RangeSetting
            label="Leaf spread"
            range={[0, 1, 0.05]}
            value={settings.leafSpread}
            onChange={(leafSpread) => change({ leafSpread })}
          />
          <RangeSetting
            label="Branch splay"
            range={[0, 1, 0.02]}
            value={settings.branchSplay}
            onChange={(branchSplay) => change({ branchSplay })}
          />
          <RangeSetting
            label="Irregularity"
            range={[0, 1, 0.05]}
            value={settings.irregularity}
            onChange={(irregularity) => change({ irregularity })}
          />
          <RangeSetting
            label="Trunk width"
            range={[0.15, 1.25, 0.05]}
            value={settings.trunkRadius}
            onChange={(trunkRadius) => change({ trunkRadius })}
          />
          <RangeSetting
            label="Taper"
            range={[0.2, 0.6, 0.01]}
            value={1 - settings.taperPerRank}
            onChange={(taper) => change({ taperPerRank: 1 - taper })}
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
        </div>
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
  previewHandlers: Record<"onPointerEnter" | "onPointerLeave" | "onFocus" | "onBlur", () => void>;
  material: BarkMaterial;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { material, isSelected, onSelect, previewHandlers } = props;
  const shine = material.metalness > 0.5 || material.roughness < 0.3 ? "white 75%" : "white 35%";

  return (
    <button
      type="button"
      title={material.label}
      aria-label={material.label}
      aria-pressed={isSelected}
      onClick={onSelect}
      {...previewHandlers}
      className={clsx(
        "flex aspect-square items-center justify-center rounded-full border",
        isSelected ? "border-ink" : "border-transparent hover:border-line",
      )}
    >
      <span
        aria-hidden="true"
        className="size-4 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${material.color}, ${shine}), ${material.color} 45%, color-mix(in oklab, ${material.color}, black 45%))`,
          opacity: "opacity" in material ? 0.65 : 1,
        }}
      />
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
    <label className="grid grid-cols-[5.5rem_1fr_2.25rem] items-center gap-1.5 text-muted text-xs">
      <span className="truncate" title={label}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={clsx(
          "h-1 w-full cursor-pointer appearance-none rounded-full bg-selected",
          "[&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-muted",
          "[&::-moz-range-thumb]:size-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-muted",
        )}
      />
      <output className="text-right tabular-nums">{value.toFixed(2)}</output>
    </label>
  );
}
