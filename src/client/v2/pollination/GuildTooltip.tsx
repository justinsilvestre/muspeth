import type { Subgroup } from "../glottometry/scoreSubgroups";
import type { Hovered } from "../scene/pickHovered";
import { abbreviateSpecies } from "./abbreviateSpecies";
import { otherSide, type Side } from "./PollinationNetwork";

type GuildTooltipProps = {
  hovered: Hovered | undefined;
  /** Where the pointer is, in pixels from the top left of the scene. */
  pointer: { x: number; y: number };
  side: Side;
  /** How many partners each body has among the encounters counted. */
  partnerCounts: Map<string, number>;
};

/** Names what the pointer is on: a body with its partners, or a guild with the partners that hold it together. */
export function GuildTooltip({ hovered, pointer, side, partnerCounts }: GuildTooltipProps) {
  if (!hovered) return null;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 max-w-80 rounded border border-line bg-panel/95 px-2 py-1 text-xs shadow"
      style={{ left: pointer.x + 14, top: pointer.y + 14 }}
    >
      {hovered.kind === "language"
        ? describeBody(hovered.name, side, partnerCounts.get(hovered.name) ?? 0)
        : describeGuild(hovered.subgroup, side)}
    </div>
  );
}

function describeBody(name: string, side: Side, partners: number) {
  const partnerWord = partnerWordFor(otherSide(side), partners);
  return (
    <>
      <b>{name}</b>
      <br />
      {side === "plants" ? "visited by" : "seen on"} {partners} {partnerWord}
    </>
  );
}

function describeGuild(guild: Subgroup, side: Side) {
  const { members, supporters, cohesiveness, subgroupiness } = guild;
  const partnerWord = partnerWordFor(otherSide(side), supporters.length);
  return (
    <>
      <b>{members.map(abbreviateSpecies).join(", ")}</b>
      <br />
      held together by {supporters.length} {partnerWord} seen on exactly these:{" "}
      {supporters.map(abbreviateSpecies).join(", ")}
      <br />
      cohesiveness {cohesiveness.toFixed(2)} · subgroupiness {subgroupiness.toFixed(1)}
    </>
  );
}

function partnerWordFor(side: Side, count: number) {
  if (side === "plants") return count === 1 ? "plant" : "plants";
  return count === 1 ? "visitor" : "visitors";
}
