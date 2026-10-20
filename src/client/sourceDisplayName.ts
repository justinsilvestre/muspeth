const sourceNames: Record<string, string> = {
  eltontraits: "EltonTraits 1.0",
  fungaltraits: "FungalTraits",
  globi: "Global Biotic Interactions (GloBI)",
  sample: "Hand-entered sample",
};

/** Names the source that a connection was imported from, for display. */
export function sourceDisplayName(source: string) {
  return sourceNames[source] ?? source;
}
