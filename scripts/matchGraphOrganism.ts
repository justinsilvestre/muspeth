import { fetchGbifMatch, fetchGbifMatchByKey } from "./gbifApi.ts";
import { chooseAlternative, readGlobiLineage, toAncestorMatch } from "./gbifLineageHints.ts";
import { findGbifKey, isTrustedKeyMatch } from "./gbifTaxon.ts";
import type { GbifMatch } from "./gbifTaxonomy.ts";
import { fetchGlobiTaxonPaths } from "./globiApi.ts";
import { mapConcurrently } from "./mapConcurrently.ts";
import { fetchWikidataTaxa } from "./wikidataApi.ts";
import { listQids } from "./wikidataQueries.ts";

const globiPathLimit = 1000;

type GraphNode = { id: string; label: string };

/**
 * Matches an organism node to the GBIF backbone through its own GBIF key when GBIF trusts that key,
 * and otherwise through its name.
 * When nothing matches, returns the doubted match for the key if there is one,
 * or else GBIF's empty match for the name.
 */
export async function matchGraphOrganism(node: GraphNode, gbifKey: number | null) {
  const matchByKey = gbifKey === null ? null : await fetchGbifMatchByKey(gbifKey);
  if (matchByKey && isTrustedKeyMatch(matchByKey)) return matchByKey;
  return matchName(node.label, matchByKey);
}

/** Matches each node with `matchGraphOrganism`, reading GBIF keys from the nodes' Wikidata items. */
export async function matchGraphOrganisms<Node extends GraphNode>(
  nodes: Node[],
  concurrency?: number,
) {
  const wikidataTaxa = await fetchWikidataTaxa(listQids(nodes.map(({ id }) => id)));
  return mapConcurrently(
    nodes,
    async (node) => ({
      node,
      match: await matchGraphOrganism(node, findGbifKey(node.id, wikidataTaxa)),
    }),
    concurrency,
  );
}

/** Matches a name within the kingdom of a doubted match, falling back to that match when nothing fits. */
async function matchName(name: string, doubtedMatch: GbifMatch | null) {
  const match = await fetchGbifMatch(name, toMatchOptions(doubtedMatch));
  if (match.matchType !== "NONE") return match;
  const lineage = readGlobiLineage(name, await fetchGlobiTaxonPaths(name, globiPathLimit));
  return (
    chooseAlternative(match, lineage) ??
    (await matchNearestAncestor(lineage.ancestorNames)) ??
    doubtedMatch ??
    match
  );
}

function toMatchOptions(doubtedMatch: GbifMatch | null): Record<string, string> {
  const kingdom = doubtedMatch?.kingdom;
  return kingdom ? { verbose: "true", kingdom } : { verbose: "true" };
}

async function matchNearestAncestor(ancestorNames: string[]) {
  for (const name of ancestorNames) {
    const match = await fetchGbifMatch(name, { strict: "true" });
    if (match.matchType === "EXACT") return toAncestorMatch(match);
  }
  return null;
}
