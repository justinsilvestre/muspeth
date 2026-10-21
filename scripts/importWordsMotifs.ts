/**
 * Links the organisms in the database to words and story motifs:
 * - their vernacular names in the GBIF backbone, and the words those names share;
 * - the words for them in the World Loanword Database (WOLD), and the words those were borrowed from;
 * - the motifs of the Thompson Motif-Index that name them.
 * Re-running it replaces what its previous run stored.
 * Usage: npm run db:import-words-motifs
 */
import { queryDatabase } from "./database.ts";
import { folkTaxa } from "./folkTaxa.ts";
import { fetchChecklist, fetchVernacularNames } from "./gbifApi.ts";
import { mapConcurrently } from "./mapConcurrently.ts";
import { matchGraphOrganisms } from "./matchGraphOrganism.ts";
import { toMotifImport } from "./motifLinks.ts";
import { toNameWordImport } from "./nameWordLinks.ts";
import { linkFolkTaxon, type MatchedOrganism, toMatchedOrganism } from "./organismTaxa.ts";
import { quoteSql } from "./quoteSql.ts";
import {
  type Checklist,
  type GbifVernacularName,
  selectVernacularNames,
  toChecklistKey,
  toOrganismNames,
} from "./vernacularNames.ts";
import { toWoldImport } from "./woldWords.ts";
import { fetchMotifIndexRows, fetchWoldTables } from "./wordsMotifsDownloads.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";

const sources = { names: "gbif_vernacular", wold: "wold", motifs: "thompson_motifs" };
const concurrency = 8;
const nameLimits = { perLanguage: 2, total: 60 };
const pushDownLimit = 3;
const containedLimit = 100;
const motifLimit = 25;

const organisms = queryDatabase<{ id: string; label: string; connectionCount: number }>(
  `SELECT id, label, (SELECT COUNT(*) FROM connections
    WHERE (source_node_id = nodes.id OR target_node_id = nodes.id)
      AND source NOT IN (${Object.values(sources).map(quoteSql).join(", ")})
  ) AS connectionCount FROM nodes WHERE kind = 'organism' ORDER BY id`,
);
const labelsById = new Map(organisms.map(({ id, label }) => [id, label]));
const matched = (await matchGraphOrganisms(organisms, concurrency)).flatMap(
  ({ node, match }) => toMatchedOrganism(node.id, match, node.connectionCount) ?? [],
);
console.log(`Matched ${matched.length} of ${organisms.length} organisms exactly in GBIF.`);
const folkLinks = folkTaxa
  .map((folkTaxon) => linkFolkTaxon(folkTaxon, matched, pushDownLimit))
  .filter(({ organisms }) => organisms.length > 0);
const wold = toWoldImport(await fetchWoldTables(), folkLinks);
const names = toNameWordImport(await collectNames(matched), wold.forms, labelsById, containedLimit);
const motifs = toMotifImport(await fetchMotifIndexRows(), folkLinks, motifLimit);
writeConnectionImport(sources.wold, wold.nodes, wold.connections);
writeConnectionImport(sources.names, names.nodes, names.connections);
writeConnectionImport(sources.motifs, motifs.nodes, motifs.connections);
console.log(
  `Stored ${wold.connections.length} WOLD, ${names.connections.length} vernacular-name and ${motifs.connections.length} motif connections for ${folkLinks.length} folk taxa.`,
);

async function collectNames(organismsToName: MatchedOrganism[]) {
  const recordsByOrganism = await mapConcurrently(
    organismsToName,
    async (organism) => ({
      organism,
      records: await fetchVernacularNames(organism.gbifKey),
    }),
    concurrency,
  );
  const checklistsByKey = await fetchChecklists(
    recordsByOrganism.flatMap(({ records }) => records),
  );
  return recordsByOrganism.flatMap(({ organism, records }) => {
    const label = labelsById.get(organism.nodeId) ?? "";
    const selected = selectVernacularNames(records, label, nameLimits);
    return toOrganismNames(organism, selected, checklistsByKey);
  });
}

/** Looks up each checklist once, through one of its records. */
async function fetchChecklists(records: GbifVernacularName[]) {
  const recordsByChecklist = new Map(records.map((record) => [toChecklistKey(record), record]));
  const checklists = await mapConcurrently(
    [...recordsByChecklist],
    ([key, record]) => lookUpChecklist(key, record.sourceTaxonKey),
    concurrency,
  );
  return new Map<string, Checklist>(checklists.flat());
}

/** Gives no checklist when GBIF cannot find it, leaving its names' licence unspecified. */
async function lookUpChecklist(key: string, sourceTaxonKey: number | undefined) {
  if (sourceTaxonKey === undefined) return [];
  try {
    return [[key, await fetchChecklist(sourceTaxonKey)] as const];
  } catch (error) {
    console.warn(`No checklist found for ${key}: ${error}`);
    return [];
  }
}
