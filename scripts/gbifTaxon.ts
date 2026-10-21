import type { GbifMatch } from "./gbifTaxonomy.ts";
import type { WikidataTaxon } from "./organismIdentity.ts";

/** A GBIF name usage, as GBIF's lookup by key returns it. */
export type GbifUsage = Omit<
  GbifMatch,
  "matchType" | "usageKey" | "acceptedUsageKey" | "status"
> & {
  key: number;
  acceptedKey?: number;
  /** For example "ACCEPTED", "DOUBTFUL" or "HOMOTYPIC_SYNONYM". */
  taxonomicStatus?: string;
};

/** What GBIF says about an organism, whether it was looked up by key or matched by name. */
export type GbifTaxon = {
  key: number;
  /** The key of the accepted taxon when the usage is a synonym. */
  acceptedKey: number | null;
  canonicalName: string | null;
  rank: string | null;
  isSynonym: boolean;
  /** How GBIF matched a name, for example "EXACT" or "FUZZY". A lookup by key counts as "EXACT". */
  matchType: string;
  kingdom: string | null;
  phylum: string | null;
  class: string | null;
  /** The genus and species of the accepted taxon. */
  genus: string | null;
  species: string | null;
};

/** Reads a usage looked up by key as an exact match of its name. */
export function toExactMatch({ key, acceptedKey, taxonomicStatus, ...usage }: GbifUsage) {
  return {
    ...usage,
    matchType: "EXACT",
    usageKey: key,
    acceptedUsageKey: acceptedKey,
    status: taxonomicStatus?.includes("SYNONYM") ? "SYNONYM" : taxonomicStatus,
  } satisfies GbifMatch;
}

/**
 * Tells whether a usage looked up by key can stand for an organism.
 * It cannot when GBIF doubts the usage, as it does for many keys that it has replaced
 * but that other databases, such as Wikidata, still cite.
 */
export function isTrustedKeyMatch(match: GbifMatch) {
  return match.status !== "DOUBTFUL";
}

/** Reads a GBIF match, or returns null when GBIF found nothing. */
export function toGbifTaxon(match: GbifMatch) {
  const key = match.usageKey;
  if (key === undefined || match.matchType === "NONE") return null;
  return {
    key,
    acceptedKey: match.acceptedUsageKey ?? null,
    canonicalName: match.canonicalName ?? null,
    rank: match.rank ?? null,
    isSynonym: (match.status ?? "").includes("SYNONYM"),
    matchType: match.matchType,
    kingdom: match.kingdom ?? null,
    phylum: match.phylum ?? null,
    class: match.class ?? null,
    genus: match.genus ?? null,
    species: match.species ?? null,
  } satisfies GbifTaxon;
}

/**
 * Finds the GBIF key of a graph node from its own identifier: a GBIF identifier, or the GBIF
 * identifier of its Wikidata item.
 */
export function findGbifKey(nodeId: string, wikidataTaxa: Map<string, WikidataTaxon>) {
  const [prefix, value = ""] = nodeId.split(":");
  const gbifId =
    prefix === "wikidata"
      ? wikidataTaxa.get(value)?.externalIds.find((id) => id.startsWith("gbif:"))
      : nodeId;
  const key = gbifId?.startsWith("gbif:") ? Number(gbifId.slice(5)) : Number.NaN;
  return Number.isInteger(key) ? key : null;
}

/** Whether a Wikidata item gives GBIF identifiers, none of which is among those GBIF matched. */
export function contradictsGbif({ externalIds }: WikidataTaxon, gbifIds: string[]) {
  const itemGbifIds = externalIds.filter((id) => id.startsWith("gbif:"));
  return (
    gbifIds.length > 0 && itemGbifIds.length > 0 && !itemGbifIds.some((id) => gbifIds.includes(id))
  );
}
