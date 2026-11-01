import type { InnovationTable } from "../glottometry/parseInnovationsCsv";
import { orient, type PollinationNetwork, type Side } from "./PollinationNetwork";

/**
 * Reads a pollination network as a table of shared partners, in the form of a glottometric table of shared innovations:
 * each organism of one side is a unit, and each organism of the other side marks the set of units it was seen with.
 * Visits counted fewer times than the minimum are left out, as encounters too rare to count.
 */
export function toSharingTable(network: PollinationNetwork, side: Side, minimumVisits = 1) {
  const bodies = (side === "plants" ? network.plants : network.visitors).map(({ name }) => name);
  const membersByPartner = new Map<string, Set<string>>();
  for (const visit of network.visits) {
    if (visit.count < minimumVisits) continue;
    const { body, partner } = orient(visit, side);
    membersByPartner.set(partner, (membersByPartner.get(partner) ?? new Set()).add(body));
  }
  const innovations = [...membersByPartner].map(([label, members]) => ({ label, members }));
  return { languages: bodies, innovations } satisfies InnovationTable;
}

/** The distinct visit counts of a network, from the smallest to the largest, as the steps of the minimum-visits control. */
export function visitCountSteps(network: PollinationNetwork) {
  return [...new Set(network.visits.map((visit) => visit.count))].sort((a, b) => a - b);
}
