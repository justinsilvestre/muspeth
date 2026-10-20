const linkPatterns = [
  ["wikidata", /wikidata\.org\/wiki\/(Q\d+)$/],
  ["gbif", /gbif\.org\/species\/(\d+)$/],
  ["ncbi", /ncbi\.nlm\.nih\.gov\/Taxonomy\/Browser\/wwwtax\.cgi\?id=(\d+)$/],
] as const;

/**
 * Reads the Wikidata, GBIF and NCBI identifiers from the links GloBI gives for a taxon,
 * for example "wikidata:Q16528286" or "gbif:2554032".
 */
export function parseTaxonLinks(links: (string | null)[]) {
  return links.flatMap((link) =>
    linkPatterns.flatMap(([prefix, pattern]) => {
      const id = link?.match(pattern)?.[1];
      return id ? [`${prefix}:${id}`] : [];
    }),
  );
}

/** Lists the Wikidata items among identifiers read by `parseTaxonLinks`. */
export function listLinkedQids(identifiers: string[]) {
  return identifiers.flatMap((id) => (id.startsWith("wikidata:") ? [id.slice(9)] : []));
}
