/**
 * Turns an ID into a number between -1 and 1 that looks random but is always the same for that ID.
 * The purpose keeps the values used for different things independent of each other.
 */
export function hashToUnit(id: string, purpose: string) {
  // FNV-1a, a simple string hash with well-spread output.
  let hash = 0x811c9dc5;
  for (const character of `${purpose}:${id}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 0x01000193);
  }
  return ((hash >>> 0) / 0xffffffff) * 2 - 1;
}
