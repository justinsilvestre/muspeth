import { abbreviateSpecies } from "./abbreviateSpecies";
import type { RelationId } from "./relations";

/** One body of a set: an organism, or a survey site, with its identifier in the first version's graph and a short label where its name is long. */
export type Body = { id: string; name: string; label?: string };

/** One body standing in a relation to one partner, with a weight where the source counted the encounters. */
export type Link = { body: string; partner: string; weight?: number; flags: string[] };

/** Everything the database records among a set's bodies under one relation; empty when nothing is recorded. */
export type Sharing = { relation: RelationId; licences: string[]; links: Link[] };

/** A set of bodies with the relations recorded among them, as the export script copies it from the database. */
export type BodySet = {
  id: string;
  name: string;
  /** The heading the set is listed under in the menu. */
  group: string;
  /** One or two sentences on what the bodies are and where they come from. */
  description: string;
  bodyNoun: { one: string; many: string };
  /** Whether body names are scientific names, to be abbreviated in the scene, or plain names shown as they are. */
  labelStyle: "species" | "plain";
  /** The study the set's bodies were taken from, where there is one. */
  citation?: { text: string; url: string };
  bodies: Body[];
  sharings: Sharing[];
};

/** The short form of a body's name, as labelled in the scene. */
export function labelOf(set: BodySet, name: string) {
  const given = set.bodies.find((body) => body.name === name)?.label;
  if (given) return given;
  return set.labelStyle === "species" ? abbreviateSpecies(name) : name;
}

/** A noun with its indefinite article, as "a plant" or "an organism". */
export function aOrAn(noun: string) {
  return `${/^[aeiou]/i.test(noun) ? "an" : "a"} ${noun}`;
}

/** A count with its noun, as "3 plants" or "1 plant". */
export function countOf(count: number, noun: { one: string; many: string }) {
  return `${count} ${count === 1 ? noun.one : noun.many}`;
}
