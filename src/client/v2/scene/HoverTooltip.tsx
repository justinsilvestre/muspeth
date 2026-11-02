import { type LanguageFamily, labelOf } from "../glottometry/families";
import type { Subgroup } from "../glottometry/scoreSubgroups";
import type { Hovered } from "./pickHovered";
import type { ScenePointer } from "./ScenePointer";
import { SceneTooltip } from "./SceneTooltip";

type HoverTooltipProps = {
  hovered: Hovered | undefined;
  pointer: ScenePointer;
  family: LanguageFamily;
  onClose: () => void;
};

/** Names what the pointer is on, or what was last tapped. */
export function HoverTooltip({ hovered, pointer, family, onClose }: HoverTooltipProps) {
  if (!hovered) return null;
  return (
    <SceneTooltip pointer={pointer} onClose={onClose}>
      {hovered.kind === "language"
        ? describeLanguage(hovered.name, family)
        : describeSubgroup(hovered.subgroup, family)}
    </SceneTooltip>
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
