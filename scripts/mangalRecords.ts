import { type MangalGeometry, parseGeometry } from "./mangalGeometry.ts";

/** A network in Mangal: one study at one site and date. */
export type MangalNetwork = {
  id: number;
  name: string;
  /** An ISO 8601 date, for example "1991-09-01". */
  date: string | null;
  geometry: MangalGeometry | null;
  description: string;
  datasetId: number | null;
};

/** The taxon that Mangal matched a node's name to. */
export type MangalTaxonomy = {
  id: number;
  name: string;
  rank: string | null;
  gbif: number | null;
  ncbi: number | null;
};

export type MangalNode = {
  id: number;
  networkId: number;
  originalName: string;
  taxonomy: MangalTaxonomy | null;
};

export type MangalInteraction = {
  nodeFrom: number;
  nodeTo: number;
  type: string;
  date: string | null;
  value: number | null;
  /** The name and description of what `value` measures, for example "number of visit by a pollinator". */
  attribute: string | null;
};

export type MangalDataset = { id: number; name: string; referenceId: number | null };

export type MangalReference = {
  id: number;
  doi: string | null;
  firstAuthor: string | null;
  year: string | null;
  bibtex: string | null;
  paperUrl: string | null;
  /** Where Mangal took the data from, for example a page of Web of Life. */
  dataUrl: string | null;
};

type Row = Record<string, unknown>;

/** Mangal calls some ranks by names that other sources do not use. */
const rankAliases: Record<string, string> = { infraspecies: "subspecies" };

export function parseNetwork(row: Row) {
  return {
    id: readId(row.id),
    name: readString(row.name) ?? "",
    date: readDate(row.date),
    geometry: parseGeometry(row.geom),
    description: readString(row.description) ?? "",
    datasetId: readNumber(row.dataset_id),
  } satisfies MangalNetwork;
}

export function parseNode(row: Row) {
  return {
    id: readId(row.id),
    networkId: readId(row.network_id),
    originalName: readString(row.original_name)?.trim() ?? "",
    taxonomy: isRow(row.taxonomy) ? parseTaxonomy(row.taxonomy) : null,
  } satisfies MangalNode;
}

function parseTaxonomy(row: Row) {
  const rank = readString(row.rank);
  return {
    id: readId(row.id),
    name: readString(row.name)?.trim() ?? "",
    rank: rank ? (rankAliases[rank] ?? rank) : null,
    gbif: readNumber(row.gbif),
    ncbi: readNumber(row.ncbi),
  } satisfies MangalTaxonomy;
}

export function parseInteraction(row: Row) {
  const attribute = isRow(row.attribute) ? row.attribute : {};
  const attributeText = [readString(attribute.name), readString(attribute.description)];
  return {
    nodeFrom: readId(row.node_from),
    nodeTo: readId(row.node_to),
    type: readString(row.type) ?? "unspecified",
    date: readDate(row.date),
    value: readNumber(row.value),
    attribute: attributeText.filter(Boolean).join(": ") || null,
  } satisfies MangalInteraction;
}

export function parseDataset(row: Row) {
  return {
    id: readId(row.id),
    name: readString(row.name) ?? "",
    referenceId: readNumber(row.ref_id),
  } satisfies MangalDataset;
}

export function parseReference(row: Row) {
  return {
    id: readId(row.id),
    doi: readString(row.doi),
    firstAuthor: readString(row.first_author),
    year: readString(row.year),
    bibtex: readString(row.bibtex),
    paperUrl: readString(row.paper_url),
    dataUrl: readString(row.data_url),
  } satisfies MangalReference;
}

export function isRow(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readId(value: unknown) {
  const id = readNumber(value);
  if (id === null) throw new Error(`Mangal gave an invalid identifier: ${JSON.stringify(value)}`);
  return id;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function readDate(value: unknown) {
  return readString(value)?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
}
