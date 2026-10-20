import { chooseWikidataTaxon, type WikidataChoice } from "./organismIdentity.ts";
import { fetchWikidataQidsByTaxonName, fetchWikidataTaxa } from "./wikidataApi.ts";

/**
 * Resolves scientific names to the Wikidata items that bear them, preferring items that share an
 * identifier, such as "gbif:1341976", that the source links to the name.
 */
export async function chooseWikidataTaxa(names: string[], linkedIdsByName: Map<string, string[]>) {
  const qidsByName = await fetchWikidataQidsByTaxonName(names);
  const taxa = await fetchWikidataTaxa([...new Set([...qidsByName.values()].flat())]);
  const choices = new Map<string, WikidataChoice>();
  for (const [name, qids] of qidsByName) {
    const candidates = qids.flatMap((qid) => taxa.get(qid) ?? []);
    const choice = chooseWikidataTaxon(name, candidates, linkedIdsByName.get(name));
    if (choice) choices.set(name, choice);
  }
  return choices;
}
