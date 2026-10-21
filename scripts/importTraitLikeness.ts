/**
 * Adds likeness links from trait databases: EltonTraits for birds and mammals, and FungalTraits
 * for fungal genera. Each organism of the seed or with an interaction that a database describes is
 * linked to its few nearest neighbours in trait space, which may be organisms new to the graph.
 * Re-running it replaces the connections and organisms of the previous run.
 * Usage: npm run db:import-likeness -- [--remote]
 * Without --remote, it writes to the local development database.
 */
import { queryD1 } from "./d1.ts";
import { toGbifTaxon } from "./gbifTaxon.ts";
import { type GraphOrganism, importLikeness } from "./likenessImport.ts";
import { loadOrganismIdsByLabel } from "./loadOrganismIdsByLabel.ts";
import { matchGraphOrganisms } from "./matchGraphOrganism.ts";
import { eltonTraits, fungalTraits } from "./traitDatabases.ts";
import { traitStartOrganismsSql } from "./traitStartOrganismsSql.ts";

const organisms = queryD1<{ id: string; label: string }>(traitStartOrganismsSql);
const existingIdByLabel = loadOrganismIdsByLabel([eltonTraits.source, fungalTraits.source]);
const classified = (await matchGraphOrganisms(organisms)).map(
  ({ node, match }) => ({ ...node, gbif: toGbifTaxon(match) }) satisfies GraphOrganism,
);
console.log(
  `Found ${classified.filter(({ gbif }) => gbif).length} of ${organisms.length} organisms in GBIF.`,
);
await importLikeness(eltonTraits, classified, existingIdByLabel);
await importLikeness(fungalTraits, classified, existingIdByLabel);
