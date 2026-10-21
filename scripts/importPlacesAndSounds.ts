/**
 * Adds the places where organisms were studied, and sound recordings from GBIF.
 * Each set of coordinates that interactions were recorded at becomes a place, linked to the
 * organisms observed there. Each organism gets a few recordings of its species, and the species
 * most recorded near each place are added with a recording each, linked to the place.
 * Re-running it replaces the places, recordings and organisms of the previous run.
 * Usage: npm run db:import-places-sounds
 */
import { queryDatabase } from "./database.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";
import { loadOrganismIdsByLabel, toOrganismsOutsideSourcesSql } from "./loadOrganismIdsByLabel.ts";
import { identifyNewTraitOrganisms } from "./newTraitOrganisms.ts";
import {
  fetchGraphOrganismRecordings,
  fetchSiteNeighbourRecordings,
} from "./soundRecordingFetches.ts";
import {
  type SoundRecording,
  toHeardInConnection,
  toRecordedNearConnection,
} from "./soundRecordings.ts";
import {
  findNearestSite,
  type LocatedObservation,
  locatedObservationsSql,
  toStudySites,
} from "./studySites.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";

const source = "gbif_sounds";
const radiusKm = 50;
const recordingsPerOrganism = 3;
const speciesPerSite = 30;

const { sites, connections: observedAt } = toStudySites(
  queryDatabase<LocatedObservation>(locatedObservationsSql),
);
const organisms = queryDatabase<{ id: string; label: string }>(
  toOrganismsOutsideSourcesSql([source]),
);
const graphRecordings = await fetchGraphOrganismRecordings(organisms, recordingsPerOrganism);
const knownSpeciesKeys = new Set(graphRecordings.map(({ taxonKey }) => taxonKey));
const neighbourRecordings = await fetchSiteNeighbourRecordings(
  sites,
  knownSpeciesKeys,
  radiusKm,
  speciesPerSite,
);
const neighbours = await identifyNewTraitOrganisms(
  source,
  [...new Map(neighbourRecordings.map((recording) => [recording.species, recording])).values()].map(
    ({ species, gbifHints }) => ({ name: species, group: "", traits: null, names: [], gbifHints }),
  ),
  loadOrganismIdsByLabel([source]),
);

const heardIn = [
  ...graphRecordings.flatMap(({ organismId, recordings, qualityFlags }) =>
    recordings.map((recording) => toHeardInConnection(organismId, recording, qualityFlags)),
  ),
  ...neighbourRecordings.flatMap((recording) =>
    (neighbours.nodesByName.get(recording.species) ?? []).map(({ nodeId, qualityFlags }) =>
      toHeardInConnection(nodeId, recording, qualityFlags),
    ),
  ),
];
const recordings = [
  ...graphRecordings.flatMap(({ recordings }) => recordings),
  ...neighbourRecordings,
];
const recordedNear = recordings.flatMap(linkToNearestSite);

const nodes = [
  ...sites.map(({ node }) => node),
  ...recordings.map(({ node }) => node),
  ...neighbours.drafts,
];
writeConnectionImport(
  source,
  [...new Map(nodes.map((node) => [node.id, node] satisfies [string, NodeDraft])).values()],
  [...observedAt, ...heardIn, ...recordedNear] satisfies ConnectionDraft[],
);
console.log(
  `${source}: ${sites.length} places, ${recordings.length} recordings (${recordedNear.length} near a place), and ${neighbours.drafts.length} organisms heard near the places.`,
);

function linkToNearestSite(recording: SoundRecording) {
  const nearest = recording.coordinates && findNearestSite(recording.coordinates, sites, radiusKm);
  return nearest
    ? [toRecordedNearConnection(recording, nearest.site.node.id, nearest.distanceKm)]
    : [];
}
