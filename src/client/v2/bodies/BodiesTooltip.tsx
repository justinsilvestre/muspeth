import { resizeCommonsImage } from "../../v1/media/resizeCommonsImage";
import type { Subgroup } from "../glottometry/scoreSubgroups";
import type { Hovered } from "../scene/pickHovered";
import { abbreviateSpecies } from "./abbreviateSpecies";
import { type BodyImage, type BodySet, bodyOf, countOf, labelOf } from "./BodySet";
import { partnerOf } from "./partnerOf";
import type { Relation } from "./relations";

/** How many of the things a membrane shares are named before the rest are counted. */
const namedSharedLimit = 6;
/** How many of the species holding a membrane together are pictured. */
const picturedSharedLimit = 4;
/** The width the pictures are fetched at, in pixels, a little over the tooltip's width. */
const pictureWidth = 500;

type BodiesTooltipProps = {
  hovered: Hovered | undefined;
  /** Where the pointer is, in pixels from the top left of the scene. */
  pointer: { x: number; y: number };
  set: BodySet;
  relation: Relation;
  /** How many shared things each dot has among the links counted. */
  sharedCounts: Map<string, number>;
};

/** Names what the pointer is on: a dot with its picture and what it shares, or a membrane with the things that hold it together. */
export function BodiesTooltip({
  hovered,
  pointer,
  set,
  relation,
  sharedCounts,
}: BodiesTooltipProps) {
  if (!hovered) return null;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 w-72 rounded border border-line bg-panel/95 px-2 py-1.5 text-xs shadow"
      style={{ left: pointer.x + 14, top: pointer.y + 14 }}
    >
      {hovered.kind === "language"
        ? describeDot(hovered.name, set, relation, sharedCounts.get(hovered.name) ?? 0)
        : describeMembrane(hovered.subgroup, set, relation)}
    </div>
  );
}

/**
 * How one shared thing is named in a sentence: a species abbreviated, with its common name in parentheses
 * where some set has one; a taxon with its rank first; anything else as it is.
 */
function sharedLabel(relation: Relation, set: BodySet) {
  if (relation.sharedAreSpecies) return (name: string) => nameSpecies(name, set);
  if (relation.id === "descent") return nameTaxon;
  return (text: string) => text;
}

function nameSpecies(name: string, set: BodySet) {
  const common = partnerOf(name, set)?.commonName;
  return common ? `${abbreviateSpecies(name)} (${common})` : abbreviateSpecies(name);
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
    <>
      {body?.image && <Pictures images={[body.image]} />}
      <div>
        <b>
          <i>{name}</i>
        </b>
        {body?.commonName && (
          <>
            <br />
            <span className="text-muted">{body.commonName}</span>
          </>
        )}
        <br />
        {relation.dotVerb} {countOf(shared, relation.shared)}
        {body?.image && <Credits images={[body.image]} />}
      </div>
    </>
  );
}

/** Credits the pictures shown, one credit per picture in order, leaving out pictures that ask for none. */
function Credits({ images }: { images: BodyImage[] }) {
  const credits = images
    .map((image) => [image.credit, image.licence].filter(Boolean).join(", "))
    .filter(Boolean);
  if (credits.length === 0) return null;
  return (
    <>
      <br />
      <span className="text-[10px] text-muted">
        {credits.length === 1 ? "Photo" : "Photos"}: {credits.join("; ")}
      </span>
    </>
  );
}

/**
 * Says what holds a membrane together: the things shared by exactly its members, as a sentence such as
 * "M. domestica visits these 3 plants and no other plant here", with pictures of them where they are species
 * some set pictures, and then names the members.
 */
function describeMembrane(membrane: Subgroup, set: BodySet, relation: Relation) {
  const { members, supporters, cohesiveness, subgroupiness } = membrane;
  const named = supporters.slice(0, namedSharedLimit).map(sharedLabel(relation, set)).join(", ");
  const rest = supporters.length - namedSharedLimit;
  const verb = supporters.length === 1 ? relation.membraneVerb.one : relation.membraneVerb.many;
  const images = relation.sharedAreSpecies ? picturesOf(supporters, set) : [];
  return (
    <>
      {images.length > 0 && <Pictures images={images} />}
      <div>
        <b>
          {upperFirst(named)}
          {rest > 0 && ` and ${countOf(rest, relation.shared)} more`} {verb} these{" "}
          {countOf(members.length, set.bodyNoun)} and no other {set.bodyNoun.one} here.
        </b>
        <br />
        {members.map((member) => labelOf(set, member)).join(", ")}
        <br />
        <span className="text-muted">
          cohesiveness {cohesiveness.toFixed(2)} · subgroupiness {subgroupiness.toFixed(1)}
        </span>
        <Credits images={images} />
      </div>
    </>
  );
}

function picturesOf(names: string[], set: BodySet) {
  return names
    .map((name) => partnerOf(name, set)?.image)
    .filter((image): image is BodyImage => image !== undefined)
    .slice(0, picturedSharedLimit);
}

/** The pictures fill the tooltip's width above the text: one on its own, several in two columns. */
function Pictures({ images }: { images: BodyImage[] }) {
  const columns = images.length === 1 ? "grid-cols-1" : "grid-cols-2";
  return (
    <div className={`mb-1.5 grid ${columns} gap-1`}>
      {images.map((image) => (
        <img
          key={image.url}
          src={resizeCommonsImage(image.url, pictureWidth)}
          alt=""
          className="aspect-[4/3] w-full rounded object-cover"
          style={{ background: "#88888822" }}
        />
      ))}
    </div>
  );
}
