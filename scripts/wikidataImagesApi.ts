import { fetchInBatches } from "./fetchInBatches.ts";
import { runSparql, wikidataEndpoint } from "./sparqlClient.ts";
import { toQid } from "./sparqlRows.ts";
import {
  buildDepictingWorksQuery,
  buildDepictionDetailsQuery,
  buildImagesQuery,
} from "./wikidataDepictionQueries.ts";
import { buildTaxonRanksQuery } from "./wikidataQueries.ts";

/** Kept small, since a subject such as the horse is depicted by thousands of works. */
const subjectBatchSize = 50;
const detailBatchSize = 50;
const imageBatchSize = 200;

/** Fetches the works with an image that depict each of the subjects, one row per pair. */
export function fetchDepictingWorks(subjectQids: string[]) {
  return fetchInBatches([...new Set(subjectQids)], subjectBatchSize, (batch) =>
    runSparql(wikidataEndpoint, buildDepictingWorksQuery(batch)),
  );
}

/** Fetches the details of works and of the statements that they depict their subjects. */
export function fetchDepictionDetails(pairs: { workQid: string; subjectQid: string }[]) {
  return fetchInBatches(pairs, detailBatchSize, (batch) =>
    runSparql(wikidataEndpoint, buildDepictionDetailsQuery(batch)),
  );
}

/** Fetches the taxonomic rank of each taxon that has one. */
export async function fetchTaxonRanks(qids: string[]) {
  const rows = await fetchInBatches([...new Set(qids)], imageBatchSize, (batch) =>
    runSparql(wikidataEndpoint, buildTaxonRanksQuery(batch)),
  );
  return new Map(rows.map((row) => [toQid(row.organism), toQid(row.rank)]));
}

/** Fetches the images that items name, one row per item and image. */
export function fetchItemImages(qids: string[]) {
  return fetchInBatches([...new Set(qids)], imageBatchSize, (batch) =>
    runSparql(wikidataEndpoint, buildImagesQuery(batch)),
  );
}
