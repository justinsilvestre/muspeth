import type { FolkTaxon } from "./folkTaxa.ts";
import { type GbifMatch, ranks } from "./gbifTaxonomy.ts";

/** An organism node matched exactly to a taxon of the GBIF backbone. */
export type MatchedOrganism = {
  nodeId: string;
  /** The key of the accepted GBIF taxon, whose vernacular names belong to the organism. */
  gbifKey: number;
  /** The organism's own rank in lowercase, for example "genus" or "variety". */
  rank: string;
  /** The names of the taxa that hold the organism, by rank, including its own. */
  lineage: Partial<Record<(typeof ranks)[number], string>>;
  /** How many connections other imports give the organism. */
  connectionCount: number;
};

/** A GBIF species match, with the keys of the matched taxon and, for a synonym, its accepted one. */
export type GbifKeyedMatch = GbifMatch & { usageKey?: number; acceptedUsageKey?: number };

/** The organisms that a folk taxon's words and motifs are linked to. */
export type FolkTaxonLink = {
  folkTaxon: FolkTaxon;
  organisms: MatchedOrganism[];
  /** Whether the organisms lie below the folk taxon's rank, so the link was pushed down. */
  isPushedDown: boolean;
};

/** Accepts only exact matches, since vernacular names must belong to the organism's own taxon. */
export function toMatchedOrganism(nodeId: string, match: GbifKeyedMatch, connectionCount: number) {
  const gbifKey = match.acceptedUsageKey ?? match.usageKey;
  if (match.matchType !== "EXACT" || gbifKey === undefined || !match.rank) return null;
  const lineage = Object.fromEntries(
    ranks.flatMap((rank) => (match[rank] ? [[rank, match[rank]]] : [])),
  );
  return {
    nodeId,
    gbifKey,
    rank: match.rank.toLowerCase(),
    lineage,
    connectionCount,
  } satisfies MatchedOrganism;
}

/**
 * Finds the organisms a folk taxon is linked to:
 * the organism that is the taxon itself,
 * or else up to `pushDownLimit` of the most connected organisms within it.
 * Pushed down, it skips organisms that lie within another of the candidates,
 * so that a genus is preferred to its own species.
 */
export function linkFolkTaxon(
  folkTaxon: FolkTaxon,
  organisms: MatchedOrganism[],
  pushDownLimit: number,
) {
  const { kingdom, rank, name } = folkTaxon.taxon;
  const members = organisms.filter(
    ({ lineage }) => lineage.kingdom === kingdom && lineage[rank] === name,
  );
  const selves = members.filter((organism) => organism.rank === rank);
  if (selves.length > 0) return { folkTaxon, organisms: selves, isPushedDown: false };
  const coarsest = members.filter((member) => !members.some((other) => isWithin(member, other)));
  const mostConnected = coarsest.sort(
    (a, b) => b.connectionCount - a.connectionCount || a.nodeId.localeCompare(b.nodeId),
  );
  return {
    folkTaxon,
    organisms: mostConnected.slice(0, pushDownLimit),
    isPushedDown: true,
  } satisfies FolkTaxonLink;
}

/** Tells whether `member` lies within the taxon of `other`, at a coarser rank than its own. */
function isWithin(member: MatchedOrganism, other: MatchedOrganism) {
  const otherRank = ranks.find((rank) => rank === other.rank);
  if (!otherRank || toDepth(otherRank) >= toDepth(member.rank)) return false;
  return member.lineage[otherRank] === other.lineage[otherRank];
}

/** Places ranks below species, such as "variety", after every rank of the backbone. */
function toDepth(rank: string) {
  const index = (ranks as readonly string[]).indexOf(rank);
  return index === -1 ? ranks.length : index;
}
