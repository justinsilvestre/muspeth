import { type Body, type BodySet, bodyOf } from "./BodySet";
import { bodySets } from "./bodySets";

/**
 * A partner named in a sharing, as the body some set has for it, where one does: the set being viewed first,
 * then the others, since a plant's visitors are the bodies of the paired set of visitors.
 * A body without a common name or picture counts only if no other set says more.
 */
export function partnerOf(
  name: string,
  set: BodySet,
  sets: BodySet[] = bodySets,
): Body | undefined {
  const candidates = [set, ...sets].flatMap((candidate) => bodyOf(candidate, name) ?? []);
  return candidates.find((body) => body.commonName || body.image) ?? candidates[0];
}
