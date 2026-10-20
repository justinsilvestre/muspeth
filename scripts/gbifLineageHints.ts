import { type GbifMatch, ranks } from "./gbifTaxonomy.ts";

/** NCBI's names for kingdoms that the GBIF backbone calls by another name. */
const gbifNamesOfNcbiKingdoms: Record<string, string> = {
  Metazoa: "Animalia",
  Viridiplantae: "Plantae",
};

/** A taxon path from GloBI, as pipe-separated names and ranks from the root down. */
export type GlobiTaxonPath = { names: string; ranks: string | null };

/** What GloBI's records say about where a name sits in the tree of life. */
export type GlobiLineage = { ancestorNames: string[]; rank: string | null };

/**
 * Combines GloBI's taxon paths for a name into its ancestors, nearest first, and its rank.
 * Ancestors from the most common path come first.
 */
export function readGlobiLineage(name: string, paths: GlobiTaxonPath[]) {
  const parsed = rankByFrequency(paths).map((path) => parsePath(name, path));
  return {
    ancestorNames: [...new Set(parsed.flatMap(({ ancestorNames }) => ancestorNames))],
    rank: parsed.find(({ rank }) => rank)?.rank ?? null,
  } satisfies GlobiLineage;
}

function rankByFrequency(paths: GlobiTaxonPath[]) {
  const counts = new Map<string, { path: GlobiTaxonPath; count: number }>();
  for (const path of paths) {
    const key = `${path.names}\n${path.ranks}`;
    counts.set(key, { path, count: (counts.get(key)?.count ?? 0) + 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).map(({ path }) => path);
}

function parsePath(name: string, path: GlobiTaxonPath) {
  const names = splitPath(path.names);
  const pathRanks = splitPath(path.ranks ?? "");
  const endsWithName = names.at(-1) === name;
  const ancestorNames = (endsWithName ? names.slice(0, -1) : names).filter(Boolean).reverse();
  return {
    ancestorNames: ancestorNames.map((ancestor) => gbifNamesOfNcbiKingdoms[ancestor] ?? ancestor),
    rank: (endsWithName && pathRanks[names.length - 1]?.toLowerCase()) || null,
  };
}

function splitPath(path: string) {
  return path.split("|").map((part) => part.trim());
}

/**
 * Picks, from the exact alternatives of an ambiguous GBIF match, the one that best fits GloBI's
 * lineage for the name. Returns null when nothing fits, or when the best fits disagree on kingdom.
 */
export function chooseAlternative(match: GbifMatch, lineage: GlobiLineage) {
  const scored = (match.alternatives ?? [])
    .filter((alternative) => alternative.matchType === "EXACT")
    .map((alternative) => ({ alternative, score: scoreFit(alternative, lineage) }))
    .filter(({ score }) => score > 0);
  const bestScore = Math.max(...scored.map(({ score }) => score));
  const best = scored
    .filter(({ score }) => score === bestScore)
    .map(({ alternative }) => alternative);
  if (new Set(best.map(({ kingdom }) => kingdom)).size !== 1) return null;
  const [chosen] = best.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  return chosen ? ({ ...chosen, hintedBy: "globi_lineage" } satisfies GbifMatch) : null;
}

function scoreFit(alternative: GbifMatch, { ancestorNames, rank }: GlobiLineage) {
  const lineageNames = new Set(ranks.map((taxonRank) => alternative[taxonRank]));
  const sharedNameCount = ancestorNames.filter((name) => lineageNames.has(name)).length;
  return sharedNameCount + (alternative.rank?.toLowerCase() === rank ? 1 : 0);
}

/** Marks a match found for an ancestor of a name as a higher-rank match for the name itself. */
export function toAncestorMatch(match: GbifMatch) {
  return { ...match, matchType: "HIGHERRANK", hintedBy: "globi_lineage" } satisfies GbifMatch;
}
