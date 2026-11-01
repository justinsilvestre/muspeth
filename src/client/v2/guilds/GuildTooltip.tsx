import { resizeCommonsImage } from "../../v1/media/resizeCommonsImage";
import type { Subgroup } from "../glottometry/scoreSubgroups";
import type { Hovered } from "../scene/pickHovered";
import { abbreviateSpecies } from "./abbreviateSpecies";
import { type Body, type BodySet, bodyOf, countOf, labelOf } from "./BodySet";
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

/** Names what the pointer is on: a dot with its picture and what it shares, or a membrane with the things that hold it together. */
export function GuildTooltip({ hovered, pointer, set, relation, sharedCounts }: GuildTooltipProps) {
  if (!hovered) return null;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 max-w-80 rounded border border-line bg-panel/95 px-2 py-1.5 text-xs shadow"
      style={{ left: pointer.x + 14, top: pointer.y + 14 }}
    >
      {hovered.kind === "language"
        ? describeDot(hovered.name, set, relation, sharedCounts.get(hovered.name) ?? 0)
        : describeGuild(hovered.subgroup, set, relation)}
    </div>
  );
}

function describeDot(name: string, set: BodySet, relation: Relation, shared: number) {
  const body = bodyOf(set, name);
  return (
    <div className="flex gap-2">
      {body?.image && (
        <img
          src={resizeCommonsImage(body.image.url, 250)}
          alt=""
          className="size-14 shrink-0 rounded object-cover"
          style={{ background: "#88888822" }}
        />
      )}
      <div>
        <b>{body?.commonName ?? name}</b>
        {body?.commonName && (
          <>
            <br />
            <i>{name}</i>
          </>
        )}
        <br />
        {relation.dotVerb} {countOf(shared, relation.shared)}
        {body?.image && <Credit image={body.image} />}
      </div>
    </div>
  );
}

function Credit({ image }: { image: NonNullable<Body["image"]> }) {
  const parts = [image.credit, image.licence].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <>
      <br />
      <span className="text-[10px] text-muted">Photo: {parts.join(", ")}</span>
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
