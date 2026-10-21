import { fetchGbifMatch, fetchGbifMatchByKey } from "./gbifApi.ts";
import { chooseAlternative, readGlobiLineage, toAncestorMatch } from "./gbifLineageHints.ts";
import { findGbifKey, isTrustedKeyMatch } from "./gbifTaxon.ts";
import { fetchGlobiTaxonPaths } from "./globiApi.ts";
import { mapConcurrently } from "./mapConcurrently.ts";
import { fetchWikidataTaxa } from "./wikidataApi.ts";
import { listQids } from "./wikidataQueries.ts";

const globiPathLimit = 1000;

type GraphNode = { id: string; label: string };

/**
 * Matches an organism node to the GBIF backbone through its own GBIF key where it has one,
 * which tells apart namesakes in different kingdoms, unless GBIF doubts the usage of that key.
 * Otherwise it matches the node through its name.
 * When GBIF cannot match the name on its own, the lineage that GloBI's records give for the name
 * picks among GBIF's alternatives, or else places the node in its nearest ancestor that GBIF knows.
 * Returns GBIF's empty match when all of these fail.
 */
export async function matchGraphOrganism(node: GraphNode, gbifKey: number | null) {
  const matchByKey = gbifKey === null ? null : await fetchGbifMatchByKey(gbifKey);
  if (matchByKey && isTrustedKeyMatch(matchByKey)) return matchByKey;
  return matchName(node.label);
}

/** Matches each node with `matchGraphOrganism`, reading GBIF keys from the nodes' Wikidata items. */
export async function matchGraphOrganisms<Node extends GraphNode>(nodes: Node[]) {
  const wikidataTaxa = await fetchWikidataTaxa(listQids(nodes.map(({ id }) => id)));
  return mapConcurrently(nodes, async (node) => ({
    node,
    match: await matchGraphOrganism(node, findGbifKey(node.id, wikidataTaxa)),
  }));
}

async function matchName(name: string) {
  const match = await fetchGbifMatch(name, { verbose: "true" });
  if (match.matchType !== "NONE") return match;
  const lineage = readGlobiLineage(name, await fetchGlobiTaxonPaths(name, globiPathLimit));
  return (
    chooseAlternative(match, lineage) ??
    (await matchNearestAncestor(lineage.ancestorNames)) ??
    match
  );
}

async function matchNearestAncestor(ancestorNames: string[]) {
  for (const name of ancestorNames) {
    const match = await fetchGbifMatch(name, { strict: "true" });
    if (match.matchType === "EXACT") return toAncestorMatch(match);
  }
  return null;
}
