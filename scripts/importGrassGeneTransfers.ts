/**
 * Adds the lateral gene transfers among grasses that Hibdige et al. (2021) found in 17 grass
 * genomes: each transferred gene becomes a node, linked to the grasses it was found in and to
 * the lineage it came from. The tables are read from the supporting information of the study's
 * preprint on bioRxiv, the one copy that can be fetched without a browser.
 * Re-running it replaces the connections and organisms of the previous run.
 * Usage: npm run db:import-gene-transfers
 */
import { cachedFetch } from "./cachedFetch.ts";
import { toGeneTransferDrafts } from "./geneTransferConnections.ts";
import { type GeneTransfer, parseGeneTransfers } from "./grassGeneTransfers.ts";
import { loadOrganismIdsByLabel } from "./loadOrganismIdsByLabel.ts";
import { identifyNewTraitOrganisms } from "./newTraitOrganisms.ts";
import type { TraitRecord } from "./traitRecord.ts";
import { userAgent } from "./userAgent.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";
import { readXlsxSheets } from "./xlsxSheets.ts";
import { readZipEntries } from "./zipArchive.ts";

const source = "grass-gene-transfers";
const supplementUrl =
  "https://www.biorxiv.org/content/biorxiv/early/2020/10/13/2020.02.17.952150/DC1/embed/media-1.zip?download=true";
const tablesArchive = "Supporting_information_tables.zip";
const geneTables = ["Supplementary_tables/Table_S2.xlsx", "Supplementary_tables/Table_S4.xlsx"];

/** The preprint is deposited under CC BY-NC-ND 4.0; the published article is under CC BY 4.0. */
const template = {
  licence: "CC-BY-NC-ND-4.0",
  sources: [
    {
      datasetId: "biorxiv:10.1101/2020.02.17.952150",
      datasetCitation:
        "Supporting information tables S2 and S4 of Hibdige et al., Widespread lateral gene transfer among grasses, bioRxiv preprint version 3 (2020). https://doi.org/10.1101/2020.02.17.952150",
      studyCitation:
        "Hibdige, S. G. S., Raimondeau, P., Christin, P.-A., & Dunning, L. T. (2021). Widespread lateral gene transfer among grasses. New Phytologist, 230(6), 2474–2486.",
      studyUrl: "https://doi.org/10.1111/nph.17328",
      recordCount: 1,
    },
  ],
};

const existingIdByLabel = loadOrganismIdsByLabel([source]);
const transfers = await fetchTransfers();
const organisms = await identifyNewTraitOrganisms(
  source,
  listOrganisms(transfers),
  existingIdByLabel,
);
const { nodes, connections } = toGeneTransferDrafts(transfers, organisms.nodesByName, template);
writeConnectionImport(source, [...organisms.drafts, ...nodes], connections);
console.log(
  `Stored ${connections.length} connections of ${transfers.length} transferred genes among ${organisms.drafts.length} grasses and lineages.`,
);

async function fetchTransfers() {
  const response = await cachedFetch(supplementUrl, { headers: { "user-agent": userAgent } });
  if (!response.ok) throw new Error(`${supplementUrl} responded ${response.status}`);
  const supplement = readZipEntries(Buffer.from(await response.arrayBuffer()));
  const tables = readZipEntries(readEntry(supplement, tablesArchive));
  return geneTables.flatMap((name) => {
    const genes = readXlsxSheets(readEntry(tables, name)).get("Genes");
    if (!genes) throw new Error(`${name} has no Genes sheet.`);
    return parseGeneTransfers(genes);
  });
}

function readEntry(entries: Map<string, Buffer>, name: string) {
  const entry = entries.get(name);
  if (!entry) throw new Error(`The archive holds no ${name}.`);
  return entry;
}

/** Lists each grass and donor lineage once, with the hints GBIF needs to match it within the grasses. */
function listOrganisms(found: GeneTransfer[]) {
  const byName = new Map<string, TraitRecord<null>>();
  const named = found.flatMap(({ recipients, donor }) => [
    ...recipients,
    ...(donor ? [donor] : []),
  ]);
  for (const { name, rank } of named) {
    byName.set(name, {
      name,
      group: "",
      traits: null,
      names: [],
      gbifHints: { kingdom: "Plantae", rank: rank.toUpperCase() },
    });
  }
  return [...byName.values()];
}
