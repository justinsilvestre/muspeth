const sourceNames: Record<string, string> = {
  cleveland: "Cleveland Museum of Art Open Access",
  eltontraits: "EltonTraits 1.0",
  fungaltraits: "FungalTraits",
  gbif_vernacular: "GBIF backbone vernacular names",
  globi: "Global Biotic Interactions (GloBI)",
  mangal: "Mangal",
  met: "The Metropolitan Museum of Art Open Access",
  sample: "Hand-entered sample",
  thompson_motifs: "Thompson's Motif-Index",
  wikidata: "Wikidata",
  "wikidata-depictions": "Wikidata depictions",
  wold: "World Loanword Database",
};

/** Names the source that a connection was imported from, for display. */
export function sourceDisplayName(source: string) {
  return sourceNames[source] ?? source;
}
