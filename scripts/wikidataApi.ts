import type { WikidataTaxon } from "./organismIdentity.ts";

const sparqlUrl = "https://query.wikidata.org/sparql";
const labelLanguages = ["en", "ja", "zh", "ko", "fr", "de", "es"];
const batchSize = 100;

type Binding = { item: { value: string }; taxonName?: { value: string }; label?: LabelValue };
type LabelValue = { value: string; "xml:lang": string };

/** Fetches the scientific names and labels of Wikidata items. */
export async function fetchWikidataTaxa(qids: string[]) {
  const taxa = new Map<string, WikidataTaxon>();
  for (let start = 0; start < qids.length; start += batchSize) {
    for (const binding of await queryItems(qids.slice(start, start + batchSize))) {
      addBinding(taxa, binding);
    }
  }
  return taxa;
}

/** Finds the Wikidata items whose scientific name (property P225) is one of the given names. */
export async function fetchWikidataQidsByTaxonName(names: string[]) {
  const qidsByName = new Map<string, string[]>();
  for (let start = 0; start < names.length; start += batchSize) {
    const literals = names.slice(start, start + batchSize).map((name) => JSON.stringify(name));
    const query = `SELECT ?item ?taxonName WHERE {
      VALUES ?taxonName { ${literals.join(" ")} }
      ?item wdt:P225 ?taxonName.
    }`;
    for (const { item, taxonName } of await runQuery(query)) {
      const name = taxonName?.value ?? "";
      qidsByName.set(name, [...(qidsByName.get(name) ?? []), toQid(item)]);
    }
  }
  return qidsByName;
}

function queryItems(qids: string[]) {
  return runQuery(`SELECT ?item ?taxonName ?label WHERE {
    VALUES ?item { ${qids.map((qid) => `wd:${qid}`).join(" ")} }
    OPTIONAL { ?item wdt:P225 ?taxonName }
    OPTIONAL { ?item rdfs:label ?label FILTER(LANG(?label) IN (${labelLanguages.map((language) => `"${language}"`).join(", ")})) }
  }`);
}

async function runQuery(query: string) {
  const response = await fetch(sparqlUrl, {
    method: "POST",
    headers: {
      accept: "application/sparql-results+json",
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": "muspeth-import (https://github.com/justinsilvestre/muspeth)",
    },
    body: new URLSearchParams({ query }),
  });
  if (!response.ok) throw new Error(`Wikidata responded ${response.status}`);
  return ((await response.json()) as { results: { bindings: Binding[] } }).results.bindings;
}

function addBinding(taxa: Map<string, WikidataTaxon>, { item, taxonName, label }: Binding) {
  const qid = toQid(item);
  const taxon = taxa.get(qid) ?? { qid, taxonNames: [], labels: [] };
  if (taxonName && !taxon.taxonNames.includes(taxonName.value)) {
    taxon.taxonNames.push(taxonName.value);
  }
  if (label && !taxon.labels.some((existing) => existing.language === label["xml:lang"])) {
    taxon.labels.push({ language: label["xml:lang"], name: label.value });
  }
  taxa.set(qid, taxon);
}

function toQid(item: Binding["item"]) {
  return item.value.split("/").at(-1) ?? "";
}
