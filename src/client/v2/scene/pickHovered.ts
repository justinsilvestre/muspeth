import type { Subgroup } from "../glottometry/scoreSubgroups";

/** What the pointer is on: a language's nucleus, or the innermost membrane under it. */
export type Hovered = { kind: "language"; name: string } | { kind: "subgroup"; subgroup: Subgroup };

/** Something hit by the pointer, carrying what it stands for in the diagram, if anything. */
type Hit = { object: { userData: { subgroup?: Subgroup; language?: string } } };

/**
 * Picks what the pointer is on. A nucleus wins over any membrane, since it is small and sits inside them.
 * Among membranes, the one with the fewest members is picked: the innermost,
 * since nested membranes all lie under a pointer aimed at the innermost of them.
 */
export function pickHovered(hits: Hit[]): Hovered | undefined {
  let innermost: Subgroup | undefined;
  for (const { object } of hits) {
    const { subgroup, language } = object.userData;
    if (language) return { kind: "language", name: language };
    if (subgroup && (!innermost || subgroup.members.length < innermost.members.length))
      innermost = subgroup;
  }
  return innermost && { kind: "subgroup", subgroup: innermost };
}
