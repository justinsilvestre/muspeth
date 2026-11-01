import type { BodySet } from "./BodySet";

export { type BodySet, countOf, labelOf } from "./BodySet";

const files = import.meta.glob<BodySet>("./sets/*.json", { eager: true, import: "default" });

/** The sets the view can draw, in the order they are offered; the first is shown at the start. */
export const bodySets = [
  "ile-aux-aigrettes-plants",
  "ile-aux-aigrettes-visitors",
  "flores-plants",
  "flores-visitors",
  "catimbau-plants",
  "catimbau-visitors",
  "piedmont-plants",
  "piedmont-visitors",
  "rotting-log",
  "jena-grassland",
  "fungi-on-hosts",
  "hosts-of-fungi",
  "grasses-genes",
  "pines-and-company",
  "kitchen-plants",
  "survey-sites",
].map((id) => {
  const set = files[`./sets/${id}.json`];
  if (!set) throw new Error(`No set file for ${id}`);
  return set;
});

export const defaultBodySet = bodySets[0] as BodySet;

/** The set's sharings grouped by the heading they are listed under, in the order of the sets. */
export function groupBodySets(sets: BodySet[]) {
  const groups = new Map<string, BodySet[]>();
  for (const set of sets) groups.set(set.group, [...(groups.get(set.group) ?? []), set]);
  return [...groups];
}
