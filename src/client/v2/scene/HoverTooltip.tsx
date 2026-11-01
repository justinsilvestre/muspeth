import { type LanguageFamily, labelOf } from "../glottometry/families";
import type { Subgroup } from "../glottometry/scoreSubgroups";
import type { Hovered } from "./pickHovered";

type HoverTooltipProps = {
  hovered: Hovered | undefined;
  /** Where the pointer is, in pixels from the top left of the scene. */
  pointer: { x: number; y: number };
  family: LanguageFamily;
};

/** Names what the pointer is on, in a small panel beside the pointer. */
export function HoverTooltip({ hovered, pointer, family }: HoverTooltipProps) {
  if (!hovered) return null;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 max-w-72 rounded border border-line bg-panel/95 px-2 py-1 text-xs shadow"
      style={{ left: pointer.x + 14, top: pointer.y + 14 }}
    >
      {hovered.kind === "language"
        ? describeLanguage(hovered.name, family)
        : describeSubgroup(hovered.subgroup, family)}
    </div>
  );
}

function describeLanguage(name: string, family: LanguageFamily) {
  const label = labelOf(family, name);
  return <b>{label === name ? name : `${name} (${label})`}</b>;
}

function describeSubgroup(subgroup: Subgroup, family: LanguageFamily) {
  const { members, support, cohesiveness, subgroupiness } = subgroup;
  return (
    <>
      <b>{members.map((member) => labelOf(family, member)).join(", ")}</b>
      <br />
      {support} supporting {support === 1 ? "innovation" : "innovations"} · cohesiveness{" "}
      {cohesiveness.toFixed(2)} · subgroupiness {subgroupiness.toFixed(1)}
    </>
  );
}
