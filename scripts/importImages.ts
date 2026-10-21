/**
 * Links images to the organisms already in the database, from Wikidata and Wikimedia Commons:
 * - works, such as paintings and prints, that Wikidata says depict an organism or its genus,
 *   as cultural objects under the source "wikidata-depictions";
 * - the image that each organism's Wikidata item names, as the organism's media, under the source
 *   "wikidata-images".
 * Images are linked, not copied, each under the licence and credit that Commons gives it.
 * Re-running it replaces what its previous run wrote.
 * Usage: npm run db:import-images -- [--remote]
 * Without --remote, it writes to the local development database.
 */
import { fetchCommonsFiles } from "./commonsApi.ts";
import { toCommonsMedia } from "./commonsMedia.ts";
import { queryD1 } from "./d1.ts";
import { toMuseumImport } from "./museumImport.ts";
import { toOrganismPhotoLinks } from "./organismPhotos.ts";
import { toQid } from "./sparqlRows.ts";
import {
  type DepictedOrganism,
  keepGenusAncestors,
  listDepictionCandidates,
  pickImageTitles,
  selectDepictionCandidates,
  toDepictionMatch,
  wikidataDepictions,
} from "./wikidataDepictions.ts";
import {
  fetchDepictingWorks,
  fetchDepictionDetails,
  fetchItemImages,
  fetchTaxonRanks,
} from "./wikidataImagesApi.ts";
import { listQids } from "./wikidataQueries.ts";
import { fetchAncestorQids } from "./wikidataTaxonNamesApi.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";
import { writeNodeMedia } from "./writeNodeMedia.ts";

/**
 * The most works whose details are fetched for one organism. It is above the number kept, as some
 * works have no image under a known licence.
 */
const candidatesPerOrganism = 15;

const organisms = await loadOrganisms();
console.log(`Found ${organisms.length} organisms with a Wikidata item.`);

const candidates = selectDepictionCandidates(
  listDepictionCandidates(
    await fetchDepictingWorks(organisms.flatMap(({ qid, ancestorQids }) => [qid, ...ancestorQids])),
    organisms,
  ),
  candidatesPerOrganism,
);
const pairs = [...new Map(candidates.map((c) => [`${c.workQid} ${c.subjectQid}`, c])).values()];
const detailRowsByWork = Map.groupBy(await fetchDepictionDetails(pairs), (row) => toQid(row.work));
const workImageTitles = pickImageTitles([...detailRowsByWork.values()].flat(), "work");
const organismImageTitles = pickImageTitles(
  await fetchItemImages(organisms.map(({ qid }) => qid)),
  "item",
);
const files = await fetchCommonsFiles([
  ...workImageTitles.values(),
  ...organismImageTitles.values(),
]);

const matches = candidates.flatMap((candidate) => {
  const file = files.get(workImageTitles.get(candidate.workQid) ?? "");
  const detailRows = detailRowsByWork.get(candidate.workQid) ?? [];
  return toDepictionMatch(candidate, detailRows, file ? toCommonsMedia(file) : null) ?? [];
});
const { nodes, connections } = toMuseumImport(matches, wikidataDepictions);
writeConnectionImport("wikidata-depictions", nodes, connections);
console.log(
  `wikidata-depictions: stored ${connections.length} connections and ${nodes.length} works.`,
);

const links = toOrganismPhotoLinks(organisms, organismImageTitles, files);
writeNodeMedia("wikidata-images", links);
console.log(`wikidata-images: linked images to ${links.length} organisms.`);

async function loadOrganisms() {
  const rows = queryD1<{ id: string }>("SELECT id FROM nodes WHERE kind = 'organism' ORDER BY id");
  const qids = listQids(rows.map(({ id }) => id));
  const ancestorQidsByQid = await fetchAncestorQids(qids);
  const ranks = await fetchTaxonRanks([...ancestorQidsByQid.values()].flat());
  return qids.map(
    (qid) =>
      ({
        id: `wikidata:${qid}`,
        qid,
        ancestorQids: keepGenusAncestors(ancestorQidsByQid.get(qid) ?? [], ranks),
      }) satisfies DepictedOrganism,
  );
}
