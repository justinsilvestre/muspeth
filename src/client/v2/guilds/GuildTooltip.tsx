import type { Subgroup } from "../glottometry/scoreSubgroups";
import type { Hovered } from "../scene/pickHovered";
import { abbreviateSpecies } from "./abbreviateSpecies";
import { type BodySet, countOf, labelOf } from "./BodySet";
import type { Relation } from "./relations";

type GuildTooltipProps = {
  hovered: Hovered | undefined;
  /** Where the pointer is, in pixels from the top left of the scene. */
  pointer: { x: number; y: number };
  set: BodySet;
  relation: Relation;
  /** How many partners each body has among the links counted. */
  partnerCounts: Map<string, number>;
};

/** Names what the pointer is on: a body with its partners, or a guild with the partners that hold it together. */
export function GuildTooltip({
  hovered,
  pointer,
  set,
  relation,
  partnerCounts,
}: GuildTooltipProps) {
  if (!hovered) return null;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 max-w-80 rounded border border-line bg-panel/95 px-2 py-1 text-xs shadow"
      style={{ left: pointer.x + 14, top: pointer.y + 14 }}
    >
      {hovered.kind === "language"
        ? describeBody(hovered.name, relation, partnerCounts.get(hovered.name) ?? 0)
        : describeGuild(hovered.subgroup, set, relation)}
    </div>
  );
}

function describeBody(name: string, relation: Relation, partners: number) {
  return (
    <>
      <b>{name}</b>
      <br />
      {relation.bodyVerb} {countOf(partners, relation.partner)}
    </>
  );
}

function describeGuild(guild: Subgroup, set: BodySet, relation: Relation) {
  const { members, supporters, cohesiveness, subgroupiness } = guild;
  const partnerLabel = relation.partnersAreSpecies ? abbreviateSpecies : (label: string) => label;
  return (
    <>
      <b>{members.map((member) => labelOf(set, member)).join(", ")}</b>
      <br />
      held together by {countOf(supporters.length, relation.partner)} {relation.guildVerb}:{" "}
      {supporters.map(partnerLabel).join(", ")}
      <br />
      cohesiveness {cohesiveness.toFixed(2)} · subgroupiness {subgroupiness.toFixed(1)}
    </>
  );
}
