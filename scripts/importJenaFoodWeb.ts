/**
 * Loads a slice of the Jena grassland meta-food web (Hines et al. 2019, Mangal network 5013),
 * which is too large to load whole: 714 organisms and 51,000 links of five types. For each type
 * of link, the organisms with the most links of that type on either side are kept, with the
 * links among them, so that every type stays represented.
 * Re-running it replaces the connections, organisms and copies of the previous run.
 * Usage: npm run db:import-jena-food-web
 */
import { executeSqlScript } from "./database.ts";
import { selectFoodWebSubset } from "./foodWebSubset.ts";
import { loadOrganismIdsByLabel } from "./loadOrganismIdsByLabel.ts";
import { fetchNetworkContent } from "./mangalApi.ts";
import { toNetworkConnections } from "./mangalConnections.ts";
import { listNetworkCopies } from "./mangalNetworkProvenance.ts";
import { identifyMangalNodes, toMangalNodeDrafts } from "./mangalNodeDrafts.ts";
import { toNetworkCopiesSql } from "./networkCopiesSql.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";

const source = "mangal-jena";
const networkId = 5013;

/** How many organisms to keep on each side of each type of link; 12 keeps about 100 organisms and 1,900 links. */
const organismsPerSide = 12;

/** Organisms kept whatever their links: the web's one fungal node. */
const pinnedNames = ["fungi"];

const existingIdByName = loadOrganismIdsByLabel([source]);
const whole = await fetchNetworkContent(networkId, Infinity);
if (!whole) throw new Error(`Mangal network ${networkId} could not be read.`);
const content = selectFoodWebSubset(whole, organismsPerSide, pinnedNames);
const { identities, choices } = await identifyMangalNodes(content.nodes, existingIdByName);
const connections = toNetworkConnections(content, identities);
const connectedIds = new Set(connections.flatMap((c) => [c.sourceNodeId, c.targetNodeId]));
const nodes = toMangalNodeDrafts(content.nodes, identities, choices, connectedIds);

writeConnectionImport(source, nodes, connections);
executeSqlScript(toNetworkCopiesSql(source, listNetworkCopies(content, [content])));
console.log(
  `Stored ${connections.length} of ${whole.interactions.length} connections among ${nodes.length} of ${whole.nodes.length} organisms.`,
);
