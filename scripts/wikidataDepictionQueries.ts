import { toValues } from "./wikidataQueries.ts";

/** The languages to label works, creators and collections in, the first available winning. */
const labelLanguages = "en,mul,ja,zh,fr,de,es,nl,it";

/**
 * Finds the works with an image whose "depicts" statements (property P180) name one of the
 * subjects. Taxa are left out, since a taxon item may name another taxon it resembles.
 */
export function buildDepictingWorksQuery(subjectQids: string[]) {
  return `SELECT ?subject ?work WHERE {
  VALUES ?subject { ${toValues(subjectQids)} }
  ?work wdt:P180 ?subject;
    wdt:P18 [].
  FILTER NOT EXISTS { ?work wdt:P225 []. }
}`;
}

/**
 * Describes works that depict subjects: their label, image, date of making, creator and
 * collection, and the references of the statement that each work depicts its subject.
 */
export function buildDepictionDetailsQuery(pairs: { workQid: string; subjectQid: string }[]) {
  const values = pairs.map(
    ({ workQid, subjectQid }) => `(${toValues([workQid])} ${toValues([subjectQid])})`,
  );
  return `SELECT ?work ?subject ?workLabel ?image ?inception ?creatorLabel ?collectionLabel ?reference WHERE {
  VALUES (?work ?subject) { ${values.join(" ")} }
  ?work wdt:P18 ?image.
  OPTIONAL { ?work wdt:P571 ?inception. }
  OPTIONAL { ?work wdt:P170 ?creator. }
  OPTIONAL { ?work wdt:P195 ?collection. }
  OPTIONAL {
    ?work p:P180 ?statement.
    ?statement ps:P180 ?subject;
      prov:wasDerivedFrom ?reference.
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${labelLanguages}". }
}`;
}

/** Finds the images (property P18) of items. */
export function buildImagesQuery(qids: string[]) {
  return `SELECT ?item ?image WHERE {
  VALUES ?item { ${toValues(qids)} }
  ?item wdt:P18 ?image.
}`;
}
