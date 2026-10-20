/** Returns the address of an organism's page; node IDs such as "wikidata:Q509308" are encoded to fit in a path. */
export function organismPath(nodeId: string) {
  return `/organisms/${encodeURIComponent(nodeId)}`;
}
