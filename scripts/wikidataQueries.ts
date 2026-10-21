/** Languages whose labels are kept for organisms, compounds and products. */
const labelLanguages = ["en", "ja", "zh", "ko", "fr", "de", "es"];

/** Lists the Wikidata items, such as "Q30034", among identifiers like "wikidata:Q30034". */
export function listQids(nodeIds: string[]) {
  return nodeIds.flatMap((id) => (/^wikidata:Q\d+$/.test(id) ? [id.slice(9)] : []));
}

/** Keeps only items that have a label in one of the kept languages. */
const labelledCompoundFilter = `FILTER EXISTS {
    ?compound rdfs:label ?anyLabel.
    FILTER(LANG(?anyLabel) IN (${toLanguageList()}))
  }`;

/** Counts the compounds that Wikidata says are found in each organism. */
export function buildCompoundCountsQuery(organismQids: string[]) {
  return `SELECT ?organism (COUNT(DISTINCT ?compound) AS ?count) WHERE {
  VALUES ?organism { ${toValues(organismQids)} }
  ?compound wdt:P703 ?organism.
} GROUP BY ?organism`;
}

/** Finds the labelled compounds found in the given organisms and also in another of all the organisms. */
export function buildSharedCompoundsQuery(organismQids: string[], allOrganismQids: string[]) {
  return `SELECT ?organism ?compound WHERE {
  VALUES ?organism { ${toValues(organismQids)} }
  ?compound wdt:P703 ?organism.
  ${labelledCompoundFilter}
  FILTER EXISTS {
    VALUES ?other { ${toValues(allOrganismQids)} }
    ?compound wdt:P703 ?other.
    FILTER(?other != ?organism)
  }
}`;
}

/** Finds a few labelled compounds found in the organism and in no other of all the organisms. */
export function buildUnsharedCompoundsQuery(
  organismQid: string,
  allOrganismQids: string[],
  limit: number,
) {
  return `SELECT ?compound WHERE {
  ?compound wdt:P703 ${toValues([organismQid])}.
  ${labelledCompoundFilter}
  FILTER NOT EXISTS {
    VALUES ?other { ${toValues(allOrganismQids)} }
    ?compound wdt:P703 ?other.
    FILTER(?other != ${toValues([organismQid])})
  }
} LIMIT ${Math.floor(limit)}`;
}

/** Finds the references of the statements that put the compounds in the organism. */
export function buildCompoundReferencesQuery(organismQid: string, compoundQids: string[]) {
  return `SELECT ?compound ?work ?url WHERE {
  VALUES ?compound { ${toValues(compoundQids)} }
  ?compound p:P703 ?statement.
  ?statement ps:P703 ${toValues([organismQid])};
    prov:wasDerivedFrom ?reference.
  OPTIONAL { ?reference pr:P248 ?work. }
  OPTIONAL { ?reference pr:P854 ?url. }
}`;
}

/** Finds the products that Wikidata says each organism is a source of, with their references. */
export function buildProductsQuery(organismQids: string[]) {
  return `SELECT ?organism ?product ?work ?url WHERE {
  VALUES ?organism { ${toValues(organismQids)} }
  ?organism p:P1672 ?statement.
  ?statement ps:P1672 ?product.
  OPTIONAL {
    ?statement prov:wasDerivedFrom ?reference.
    OPTIONAL { ?reference pr:P248 ?work. }
    OPTIONAL { ?reference pr:P854 ?url. }
  }
}`;
}

/** Finds the labels of items in the kept languages. */
export function buildLabelsQuery(qids: string[]) {
  return `SELECT ?item ?label ?language WHERE {
  VALUES ?item { ${toValues(qids)} }
  ?item rdfs:label ?label.
  BIND(LANG(?label) AS ?language)
  FILTER(?language IN (${toLanguageList()}))
}`;
}

/** Finds the taxonomic ranks of organisms. */
export function buildTaxonRanksQuery(organismQids: string[]) {
  return `SELECT ?organism ?rank WHERE {
  VALUES ?organism { ${toValues(organismQids)} }
  ?organism wdt:P105 ?rank.
}`;
}

/** Finds the titles, DOIs and publication dates of works that references cite. */
export function buildWorksQuery(workQids: string[]) {
  return `SELECT ?work ?title ?label ?doi ?date WHERE {
  VALUES ?work { ${toValues(workQids)} }
  OPTIONAL { ?work wdt:P1476 ?title. }
  OPTIONAL { ?work rdfs:label ?label. FILTER(LANG(?label) = "en") }
  OPTIONAL { ?work wdt:P356 ?doi. }
  OPTIONAL { ?work wdt:P577 ?date. }
}`;
}

/** Finds the English common names (property P1843) and English labels of taxa. */
export function buildTaxonNamesQuery(taxonQids: string[]) {
  return `SELECT ?taxon ?name WHERE {
  VALUES ?taxon { ${toValues(taxonQids)} }
  { ?taxon wdt:P1843 ?name. } UNION { ?taxon rdfs:label ?name. }
  FILTER(LANG(?name) = "en")
}`;
}

/**
 * Finds the scientific names (property P225), the labels in the kept languages,
 * and the GBIF (P846) and NCBI (P685) identifiers of items.
 */
export function buildTaxaQuery(qids: string[]) {
  return `SELECT ?item ?taxonName ?label ?language ?gbif ?ncbi WHERE {
  VALUES ?item { ${toValues(qids)} }
  OPTIONAL { ?item wdt:P225 ?taxonName }
  OPTIONAL { ?item wdt:P846 ?gbif }
  OPTIONAL { ?item wdt:P685 ?ncbi }
  OPTIONAL {
    ?item rdfs:label ?label.
    BIND(LANG(?label) AS ?language)
    FILTER(?language IN (${toLanguageList()}))
  }
}`;
}

/** Finds the items whose scientific name (property P225) is one of the given names. */
export function buildQidsByTaxonNameQuery(names: string[]) {
  return `SELECT ?item ?taxonName WHERE {
  VALUES ?taxonName { ${names.map((name) => JSON.stringify(name)).join(" ")} }
  ?item wdt:P225 ?taxonName.
}`;
}

/** Finds the items whose GBIF taxon identifier (property P846) is one of the given keys. */
export function buildQidsByGbifKeyQuery(keys: number[]) {
  return `SELECT ?item ?gbif WHERE {
  VALUES ?gbif { ${keys.map((key) => `"${key}"`).join(" ")} }
  ?item wdt:P846 ?gbif.
}`;
}

/** Finds the parent taxon (property P171) of each taxon, with the parent's rank when it has one. */
export function buildParentsQuery(taxonQids: string[]) {
  return `SELECT ?taxon ?parent ?rank WHERE {
  VALUES ?taxon { ${toValues(taxonQids)} }
  ?taxon wdt:P171 ?parent.
  OPTIONAL { ?parent wdt:P105 ?rank. }
}`;
}

function toValues(qids: string[]) {
  return qids
    .map((qid) => {
      if (!/^Q\d+$/.test(qid)) throw new Error(`Not a Wikidata item identifier: ${qid}`);
      return `wd:${qid}`;
    })
    .join(" ");
}

function toLanguageList() {
  return labelLanguages.map((language) => `"${language}"`).join(", ");
}
