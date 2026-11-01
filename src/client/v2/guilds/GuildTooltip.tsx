import type { Subgroup } from "../glottometry/scoreSubgroups";
import type { Hovered } from "../scene/pickHovered";
import { abbreviateSpecies } from "./abbreviateSpecies";
import { type BodySet, countOf, labelOf } from "./BodySet";
import type { Relation } from "./relations";

/** How many of the things a guild shares are named before the rest are counted. */
const namedSharedLimit = 6;

type GuildTooltipProps = {
  hovered: Hovered | undefined;
  /** Where the pointer is, in pixels from the top left of the scene. */
  pointer: { x: number; y: number };
  set: BodySet;
  relation: Relation;
  /** How many shared things each dot has among the links counted. */
  sharedCounts: Map<string, number>;
};

/** Names what the pointer is on: a dot with what it shares, or a membrane with the things that hold it together. */
export function GuildTooltip({ hovered, pointer, set, relation, sharedCounts }: GuildTooltipProps) {
  if (!hovered) return null;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 max-w-80 rounded border border-line bg-panel/95 px-2 py-1 text-xs shadow"
      style={{ left: pointer.x + 14, top: pointer.y + 14 }}
    >
      {hovered.kind === "language"
        ? describeDot(hovered.name, relation, sharedCounts.get(hovered.name) ?? 0)
        : describeGuild(hovered.subgroup, set, relation)}
    </div>
  );
}

function describeDot(name: string, relation: Relation, shared: number) {
  return (
    <>
      <b>{name}</b>
      <br />
      {relation.dotVerb} {countOf(shared, relation.shared)}
    </>
  );
}

function describeGuild(guild: Subgroup, set: BodySet, relation: Relation) {
  const { members, supporters, cohesiveness, subgroupiness } = guild;
  const label = relation.sharedAreSpecies ? abbreviateSpecies : (text: string) => text;
  const named = supporters.slice(0, namedSharedLimit).map(label).join(", ");
  const rest = supporters.length - namedSharedLimit;
  const verb = supporters.length === 1 ? relation.guildVerb.one : relation.guildVerb.many;
  return (
    <>
      <b>{members.map((member) => labelOf(set, member)).join(", ")}</b>
      <br />
      {named}
      {rest > 0 && ` and ${countOf(rest, relation.shared)} more`} {verb} {set.bodyNoun.many}.
      <br />
      <span className="text-muted">
        cohesiveness {cohesiveness.toFixed(2)} · subgroupiness {subgroupiness.toFixed(1)}
      </span>
    </>
  );
}
