import { type Coordinates, distanceKm } from "../src/shared/distanceKm.ts";
import type { ConnectionSource } from "../src/shared/graph.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";

/** One organism's part in an interaction recorded at a known place, with a source of it. */
export type LocatedObservation = {
  nodeId: string;
  place: string;
  latitude: number;
  longitude: number;
  licence: string;
  datasetId: string | null;
  datasetCitation: string | null;
  studyCitation: string | null;
  studyUrl: string | null;
};

/** A place where organisms were studied, as a node with its coordinates. */
export type StudySite = { node: NodeDraft; coordinates: Coordinates };

/** Selects each organism's part in every interaction that has coordinates, once per source. */
export const locatedObservationsSql = `SELECT DISTINCT nodes.id AS nodeId, connections.place,
  connections.latitude, connections.longitude, connections.licence,
  connection_sources.dataset_id AS datasetId, connection_sources.dataset_citation AS datasetCitation,
  connection_sources.study_citation AS studyCitation, connection_sources.study_url AS studyUrl
FROM connections
JOIN nodes ON nodes.id IN (connections.source_node_id, connections.target_node_id)
LEFT JOIN connection_sources ON connection_sources.connection_id = connections.id
WHERE connections.kind = 'interaction' AND connections.latitude IS NOT NULL
  AND connections.longitude IS NOT NULL AND connections.place IS NOT NULL
  AND nodes.kind = 'organism'
ORDER BY nodes.id, datasetId`;

/**
 * Makes a place node for each set of coordinates that interactions were recorded at,
 * and links each organism in those interactions to it.
 */
export function toStudySites(observations: LocatedObservation[]) {
  const sitesById = new Map<string, StudySite>();
  const connectionsByKey = new Map<string, ConnectionDraft>();
  for (const observation of observations) {
    const site = toStudySite(observation);
    if (!sitesById.has(site.node.id)) sitesById.set(site.node.id, site);
    const key = `${observation.nodeId}\n${site.node.id}`;
    const connection = connectionsByKey.get(key) ?? toObservedAtConnection(observation, site);
    connectionsByKey.set(key, addSource(connection, toSource(observation)));
  }
  return { sites: [...sitesById.values()], connections: [...connectionsByKey.values()] };
}

/** Finds the nearest site within `radiusKm` of the coordinates, with its distance. */
export function findNearestSite(coordinates: Coordinates, sites: StudySite[], radiusKm: number) {
  const nearby = sites
    .map((site) => ({ site, distanceKm: distanceKm(coordinates, site.coordinates) }))
    .filter((candidate) => candidate.distanceKm <= radiusKm);
  return nearby.sort((a, b) => a.distanceKm - b.distanceKm)[0] ?? null;
}

function toStudySite({ place, latitude, longitude }: LocatedObservation) {
  return {
    node: {
      id: `site:${latitude.toFixed(3)},${longitude.toFixed(3)}`,
      kind: "place",
      label: place,
      names: [],
    },
    coordinates: { latitude, longitude },
  } satisfies StudySite;
}

function toObservedAtConnection(observation: LocatedObservation, site: StudySite) {
  return {
    sourceNodeId: observation.nodeId,
    targetNodeId: site.node.id,
    kind: "shared_place_and_sound",
    relation: "observed at",
    basis: "observed",
    taxonomicLevel: null,
    place: observation.place,
    latitude: observation.latitude,
    longitude: observation.longitude,
    licence: observation.licence,
    qualityFlags: [],
    sources: [],
  } satisfies ConnectionDraft;
}

function toSource(observation: LocatedObservation) {
  const { datasetId, datasetCitation, studyCitation, studyUrl } = observation;
  return { datasetId, datasetCitation, studyCitation, studyUrl, recordCount: null };
}

function addSource(connection: ConnectionDraft, source: ConnectionSource) {
  const isKnown = connection.sources.some(({ datasetId }) => datasetId === source.datasetId);
  return isKnown ? connection : { ...connection, sources: [...connection.sources, source] };
}
