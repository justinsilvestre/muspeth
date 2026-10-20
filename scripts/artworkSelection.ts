import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { Artwork } from "./artworkDrafts.ts";
import type { NameKind } from "./museumNames.ts";

/** The most artworks kept for one organism from one museum. */
export const artworksPerOrganism = 10;

/** An artwork found for an organism, and how it was matched. */
export type ArtworkMatch = {
  organismId: string;
  artwork: Artwork;
  /**
   * "id" when the museum's subject tag carries the organism's Wikidata item, "ancestor" when it
   * carries the item of a taxon above the organism, else a name.
   */
  by: "id" | "ancestor" | { name: string; kind: NameKind };
};

/**
 * The flags that a match carries: a match by an ancestor's item is pushed down from a coarser
 * taxon, and a match by name is only a text match.
 */
export function toMatchFlags({ by }: ArtworkMatch) {
  if (by === "id") return [] satisfies QualityFlag[];
  if (by === "ancestor") return ["derived_from_coarser_level"] satisfies QualityFlag[];
  return ["text_match"] satisfies QualityFlag[];
}

/**
 * Keeps the best `limit` artworks of each organism, each artwork once.
 * Matches by identifier come first, then by an ancestor's identifier, then scientific names, then longer common names, which are
 * less likely to mean something else than a short name like "pine" or "crane".
 */
export function selectArtworkMatches(matches: ArtworkMatch[], limit = artworksPerOrganism) {
  const best = new Map<string, ArtworkMatch>();
  for (const match of matches) {
    const key = `${match.organismId} ${match.artwork.id}`;
    const known = best.get(key);
    if (!known || toRank(match) < toRank(known)) best.set(key, match);
  }
  const byOrganism = Map.groupBy(best.values(), ({ organismId }) => organismId);
  return [...byOrganism.values()].flatMap((organismMatches) =>
    organismMatches.toSorted(compareMatches).slice(0, limit),
  );
}

function compareMatches(a: ArtworkMatch, b: ArtworkMatch) {
  return (
    toRank(a) - toRank(b) || a.artwork.id.localeCompare(b.artwork.id, undefined, { numeric: true })
  );
}

function toRank({ by }: ArtworkMatch) {
  if (by === "id") return 0;
  if (by === "ancestor") return 1;
  if (by.kind === "scientific") return 2;
  return by.name.includes(" ") ? 3 : 4;
}
