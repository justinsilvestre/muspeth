import type { WikidataTaxon } from "./organismIdentity.ts";

/** A GBIF name usage, as returned by GBIF's species lookup or its name match. */
export type GbifUsage = {
  key?: number;
  usageKey?: number;
  acceptedKey?: number;
  acceptedUsageKey?: number;
  canonicalName?: string;
  rank?: string;
  status?: string;
  taxonomicStatus?: string;
  matchType?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  genus?: string;
  species?: string;
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

/** Reads a GBIF usage, or returns null when GBIF found nothing. */
export function toGbifTaxon(usage: GbifUsage) {
  const key = usage.usageKey ?? usage.key;
  if (key === undefined || usage.matchType === "NONE") return null;
  return {
    key,
    acceptedKey: usage.acceptedUsageKey ?? usage.acceptedKey ?? null,
    canonicalName: usage.canonicalName ?? null,
    rank: usage.rank ?? null,
    isSynonym: (usage.status ?? usage.taxonomicStatus ?? "").includes("SYNONYM"),
    matchType: usage.matchType ?? "EXACT",
    kingdom: usage.kingdom ?? null,
    phylum: usage.phylum ?? null,
    class: usage.class ?? null,
    genus: usage.genus ?? null,
    species: usage.species ?? null,
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
