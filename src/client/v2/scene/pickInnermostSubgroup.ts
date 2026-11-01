import type { Subgroup } from "../glottometry/scoreSubgroups";

/** Something hit by the pointer, carrying the subgroup it belongs to when it is a membrane. */
type Hit = { object: { userData: { subgroup?: Subgroup } } };

/**
 * Picks, among the membranes under the pointer, the one with the fewest members: the innermost,
 * since nested membranes all lie under a pointer aimed at the innermost of them.
 */
export function pickInnermostSubgroup(hits: Hit[]) {
  let innermost: Subgroup | undefined;
  for (const { object } of hits) {
    const { subgroup } = object.userData;
    if (subgroup && (!innermost || subgroup.members.length < innermost.members.length))
      innermost = subgroup;
  }
  return innermost;
}
