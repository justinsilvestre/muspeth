import { cachedFetch } from "./cachedFetch.ts";
import type { MangalNetworkContent } from "./mangalConnections.ts";
import {
  isRow,
  type MangalDataset,
  type MangalReference,
  parseDataset,
  parseInteraction,
  parseNetwork,
  parseNode,
  parseReference,
} from "./mangalRecords.ts";
import { userAgent } from "./userAgent.ts";

const apiUrl = "https://mangal.io/api/v2/";
const pageSize = 1000;

/** Datasets and references by identifier, since many networks share one. */
const datasetRequests = new Map<number, Promise<MangalDataset>>();
const referenceRequests = new Map<number, Promise<MangalReference>>();

/** Lists the networks that hold a node matched to the named taxon. */
export async function fetchNetworkIdsOfTaxon(taxonName: string) {
  const taxonomies = (await fetchAllRows("taxonomy", { name: taxonName })) ?? [];
  const networkIds = new Set<number>();
  for (const { id } of taxonomies) {
    const nodes = (await fetchAllRows("node", { taxonomy_id: String(id) })) ?? [];
    for (const node of nodes) networkIds.add(parseNode(node).networkId);
  }
  return [...networkIds];
}

/**
 * Fetches a network with its nodes, interactions, dataset and reference, or returns null when it
 * has more than `maxInteractionCount` interactions.
 */
export async function fetchNetworkContent(id: number, maxInteractionCount: number) {
  const interactions = await fetchNetworkInteractions(id, maxInteractionCount);
  if (!interactions) return null;
  const network = parseNetwork(await fetchRow(`network/${id}`));
  const dataset = network.datasetId === null ? null : await fetchDataset(network.datasetId);
  const referenceId = dataset?.referenceId ?? null;
  return {
    network,
    dataset,
    reference: referenceId === null ? null : await fetchReference(referenceId),
    nodes: await fetchNetworkNodes(id),
    interactions,
  } satisfies MangalNetworkContent;
}

function fetchDataset(id: number) {
  const request = datasetRequests.get(id) ?? fetchRow(`dataset/${id}`).then(parseDataset);
  datasetRequests.set(id, request);
  return request;
}

function fetchReference(id: number) {
  const request = referenceRequests.get(id) ?? fetchRow(`reference/${id}`).then(parseReference);
  referenceRequests.set(id, request);
  return request;
}

async function fetchNetworkNodes(networkId: number) {
  return ((await fetchAllRows("node", { network_id: String(networkId) })) ?? []).map(parseNode);
}

async function fetchNetworkInteractions(networkId: number, maxCount: number) {
  const rows = await fetchAllRows("interaction", { network_id: String(networkId) }, maxCount);
  return rows?.map(parseInteraction) ?? null;
}

/**
 * Fetches every row of a listing in order of identifier, without which Mangal's pages may repeat
 * or skip rows. Returns null when the listing has more than `maxCount` rows.
 */
async function fetchAllRows(path: string, filters: Record<string, string>, maxCount = Infinity) {
  const rows: Record<string, unknown>[] = [];
  for (let page = 0; ; page++) {
    const query = { ...filters, sort: "id", count: String(pageSize), page: String(page) };
    const { body, total } = await fetchJson(`${path}?${new URLSearchParams(query)}`);
    if (total !== null && total > maxCount) return null;
    if (!Array.isArray(body)) throw new Error(`Mangal did not list rows for ${path}`);
    rows.push(...body.filter(isRow));
    if (body.length < pageSize || rows.length >= (total ?? Infinity)) return rows;
  }
}

async function fetchRow(path: string) {
  const { body } = await fetchJson(path);
  if (!isRow(body)) throw new Error(`Mangal did not give a row for ${path}`);
  return body;
}

/** Fetches a response and the total number of rows that its Content-Range header reports, if any. */
async function fetchJson(path: string) {
  const url = new URL(path, apiUrl);
  const response = await cachedFetch(url, { headers: { "user-agent": userAgent } });
  if (!response.ok) throw new Error(`Mangal responded ${response.status} for ${url}`);
  const total = Number(response.headers.get("content-range")?.split("/")[1] ?? Number.NaN);
  return { body: (await response.json()) as unknown, total: Number.isNaN(total) ? null : total };
}
