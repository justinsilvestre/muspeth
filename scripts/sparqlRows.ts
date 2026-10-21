/** One result row of a SPARQL query, from variable name to value. */
export type SparqlRow = Record<string, string>;

type SparqlBinding = Record<string, { value: string }>;

/** Flattens the bindings of a SPARQL JSON response into plain rows. */
export function toSparqlRows(bindings: SparqlBinding[]) {
  return bindings.map(
    (binding) =>
      Object.fromEntries(
        Object.entries(binding).map(([variable, { value }]) => [variable, value]),
      ) satisfies SparqlRow,
  );
}

/** Reads the identifier at the end of an entity address, for example "Q30034". */
export function toQid(address: string | undefined) {
  return address?.split("/").at(-1) ?? "";
}

/** Tells whether an identifier names a Wikidata item, as opposed to a lexeme, sense or property. */
export function isItemQid(id: string) {
  return /^Q\d+$/.test(id);
}
