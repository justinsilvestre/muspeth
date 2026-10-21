import type { WikidataTaxon } from "./organismIdentity.ts";
import { userAgent } from "./userAgent.ts";

const sparqlUrl = "https://query.wikidata.org/sparql";
const labelLanguages = ["en", "ja", "zh", "ko", "fr", "de", "es"];
const batchSize = 100;

type Binding = {
  item: { value: string };
  taxonName?: { value: string };
  label?: LabelValue;
  gbif?: { value: string };
  ncbi?: { value: string };
};
type LabelValue = { value: string; "xml:lang": string };

/** Fetches the scientific names, labels, and GBIF and NCBI identifiers of Wikidata items. */
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

/** Finds the Wikidata items whose GBIF taxon identifier (property P846) is one of the given keys. */
export async function fetchWikidataQidsByGbifKey(keys: number[]) {
  const qidsByKey = new Map<number, string[]>();
  for (let start = 0; start < keys.length; start += batchSize) {
    const literals = keys.slice(start, start + batchSize).map((key) => `"${key}"`);
    const query = `SELECT ?item ?gbif WHERE {
      VALUES ?gbif { ${literals.join(" ")} }
      ?item wdt:P846 ?gbif.
    }`;
    for (const { item, gbif } of await runQuery(query)) {
      const key = Number(gbif?.value);
      qidsByKey.set(key, [...(qidsByKey.get(key) ?? []), toQid(item)]);
    }
  }
  return qidsByKey;
}

function queryItems(qids: string[]) {
  return runQuery(`SELECT ?item ?taxonName ?label ?gbif ?ncbi WHERE {
    VALUES ?item { ${qids.map((qid) => `wd:${qid}`).join(" ")} }
    OPTIONAL { ?item wdt:P225 ?taxonName }
    OPTIONAL { ?item wdt:P846 ?gbif }
    OPTIONAL { ?item wdt:P685 ?ncbi }
    OPTIONAL { ?item rdfs:label ?label FILTER(LANG(?label) IN (${labelLanguages.map((language) => `"${language}"`).join(", ")})) }
  }`);
}

async function runQuery(query: string) {
  const response = await fetch(sparqlUrl, {
    method: "POST",
    headers: {
      accept: "application/sparql-results+json",
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": userAgent,
    },
    body: new URLSearchParams({ query }),
  });
  if (!response.ok) throw new Error(`Wikidata responded ${response.status}`);
  return ((await response.json()) as { results: { bindings: Binding[] } }).results.bindings;
}

function addBinding(taxa: Map<string, WikidataTaxon>, binding: Binding) {
  const qid = toQid(binding.item);
  const taxon = taxa.get(qid) ?? { qid, taxonNames: [], labels: [], externalIds: [] };
  const { taxonName, label, gbif, ncbi } = binding;
  if (taxonName) addOnce(taxon.taxonNames, taxonName.value);
  if (gbif) addOnce(taxon.externalIds, `gbif:${gbif.value}`);
  if (ncbi) addOnce(taxon.externalIds, `ncbi:${ncbi.value}`);
  if (label && !taxon.labels.some((existing) => existing.language === label["xml:lang"])) {
    taxon.labels.push({ language: label["xml:lang"], name: label.value });
  }
  taxa.set(qid, taxon);
}

function addOnce(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function toQid(item: Binding["item"]) {
  return item.value.split("/").at(-1) ?? "";
}
