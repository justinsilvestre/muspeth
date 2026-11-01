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

/** How one shared thing is named in a sentence: a species abbreviated, a taxon with its rank first, anything else as it is. */
function sharedLabel(relation: Relation) {
  if (relation.sharedAreSpecies) return abbreviateSpecies;
  if (relation.id === "descent") return nameTaxon;
  return (text: string) => text;
}

/** Turns "Magnoliopsida (class)" into "the class Magnoliopsida". */
function nameTaxon(label: string) {
  const match = /^(.+) \((\w+)\)$/.exec(label);
  return match ? `the ${match[2]} ${match[1]}` : label;
}

function upperFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
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

/**
 * Says what holds a guild together: the things shared by exactly its members, as a sentence such as
 * "M. domestica visits these 3 plants and no other plant here".
 */
function describeGuild(guild: Subgroup, set: BodySet, relation: Relation) {
  const { members, supporters, cohesiveness, subgroupiness } = guild;
  const named = supporters.slice(0, namedSharedLimit).map(sharedLabel(relation)).join(", ");
  const rest = supporters.length - namedSharedLimit;
  const verb = supporters.length === 1 ? relation.guildVerb.one : relation.guildVerb.many;
  return (
    <>
      <b>{members.map((member) => labelOf(set, member)).join(", ")}</b>
      <br />
      {upperFirst(named)}
      {rest > 0 && ` and ${countOf(rest, relation.shared)} more`} {verb} these{" "}
      {countOf(members.length, set.bodyNoun)} and no other {set.bodyNoun.one} here.
      <br />
      <span className="text-muted">
        cohesiveness {cohesiveness.toFixed(2)} · subgroupiness {subgroupiness.toFixed(1)}
      </span>
    </>
  );
}
