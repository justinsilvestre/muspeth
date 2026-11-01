import type { InnovationTable } from "../glottometry/parseInnovationsCsv";
import type { BodySet, Sharing } from "./BodySet";

/**
 * Reads what a set's bodies share under one relation as a glottometric table of shared innovations:
 * each body is a unit, and each partner marks the set of bodies it is linked to.
 * Links weighted below the minimum are left out, as encounters too rare to count.
 */
export function toSharingTable(set: BodySet, sharing: Sharing, minimumWeight = 1) {
  const membersByPartner = new Map<string, Set<string>>();
  for (const { body, partner, weight } of sharing.links) {
    if (weight !== undefined && weight < minimumWeight) continue;
    membersByPartner.set(partner, (membersByPartner.get(partner) ?? new Set()).add(body));
  }
  const innovations = [...membersByPartner].map(([label, members]) => ({ label, members }));
  return { languages: set.bodies.map(({ name }) => name), innovations } satisfies InnovationTable;
}

/** How many membranes a relation draws: the distinct sets of bodies its partners pick out, short of singles and the whole set. */
export function countMembranes(set: BodySet, sharing: Sharing) {
  const { innovations, languages } = toSharingTable(set, sharing);
  const keys = innovations
    .filter(({ members }) => members.size > 1 && members.size < languages.length)
    .map(({ members }) => [...members].sort().join("\0"));
  return new Set(keys).size;
}

/** The distinct weights of a sharing, from the smallest to the largest, as the steps of the minimum-weight control; empty when unweighted. */
export function weightSteps(sharing: Sharing) {
  const weights = sharing.links.flatMap(({ weight }) => (weight === undefined ? [] : [weight]));
  return [...new Set(weights)].sort((a, b) => a - b);
}
