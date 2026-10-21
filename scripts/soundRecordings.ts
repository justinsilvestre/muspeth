import type { Coordinates } from "../src/shared/placeAndPeriodQuery.ts";
import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import { toCreativeCommonsLicence } from "./creativeCommonsLicence.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";

/** A GBIF occurrence, with the fields that the sound import reads. */
export type GbifSoundOccurrence = {
  key: number;
  datasetKey: string;
  datasetName?: string;
  license?: string;
  species?: string;
  speciesKey?: number;
  kingdom?: string;
  class?: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  eventDate?: string;
  locality?: string;
  stateProvince?: string;
  country?: string;
  media?: GbifMedia[];
};

type GbifMedia = {
  type?: string;
  identifier?: string;
  references?: string;
  license?: string;
  creator?: string;
  rightsHolder?: string;
};

/** A sound recording of an organism, as a node with where and when it was made. */
export type SoundRecording = {
  node: NodeDraft;
  species: string;
  speciesKey: number | null;
  gbifHints: Record<string, string>;
  recordist: string | null;
  coordinates: Coordinates | null;
  place: string | null;
  date: string | null;
  connectionTemplate: Pick<ConnectionDraft, "licence" | "sources">;
};

/**
 * Converts a GBIF occurrence into a recording of its first sound, linked under the sound's own
 * licence. Gives null when the occurrence names no species or has no sound under a known
 * Creative Commons licence.
 */
export function toSoundRecording(occurrence: GbifSoundOccurrence) {
  const sound = occurrence.media?.find(({ type, identifier }) => type === "Sound" && identifier);
  const licence = toCreativeCommonsLicence(sound?.license);
  const { species } = occurrence;
  if (!sound?.identifier || !licence || !species) return null;
  const place = describePlace(occurrence);
  const date = toIsoDate(occurrence.eventDate);
  const recordist = sound.rightsHolder ?? sound.creator ?? null;
  const occurrenceUrl = `https://www.gbif.org/occurrence/${occurrence.key}`;
  return {
    node: {
      id: `gbif-occurrence:${occurrence.key}`,
      kind: "recording",
      label: [species, place, date?.slice(0, 4)].filter(Boolean).join(", "),
      names: [],
      media: {
        url: sound.identifier,
        licence,
        credit: recordist,
        pageUrl: sound.references ?? occurrenceUrl,
      },
    },
    species,
    speciesKey: occurrence.speciesKey ?? null,
    gbifHints: toGbifHints(occurrence),
    recordist,
    coordinates: toCoordinates(occurrence),
    place,
    date,
    connectionTemplate: {
      licence: toCreativeCommonsLicence(occurrence.license) ?? licence,
      sources: [
        {
          datasetId: `gbif:${occurrence.datasetKey}`,
          datasetCitation: occurrence.datasetName ? `${occurrence.datasetName}, via GBIF.` : null,
          studyCitation: null,
          studyUrl: occurrenceUrl,
          recordCount: 1,
        },
      ],
    },
  } satisfies SoundRecording;
}

/** Links an organism to a recording of it. */
export function toHeardInConnection(
  organismId: string,
  recording: SoundRecording,
  qualityFlags: QualityFlag[],
) {
  return {
    ...recording.connectionTemplate,
    sourceNodeId: organismId,
    targetNodeId: recording.node.id,
    kind: "shared_place_and_sound",
    relation: "heard in",
    basis: "observed",
    taxonomicLevel: "species",
    place: recording.place,
    latitude: recording.coordinates?.latitude ?? null,
    longitude: recording.coordinates?.longitude ?? null,
    date: recording.date,
    qualityFlags,
  } satisfies ConnectionDraft;
}

/** Links a recording to a place near where it was made, `distanceKm` away. */
export function toRecordedNearConnection(
  recording: SoundRecording,
  placeId: string,
  distanceKm: number,
) {
  return {
    ...toHeardInConnection(recording.node.id, recording, []),
    targetNodeId: placeId,
    relation: "recorded near",
    weight: Math.round(distanceKm * 10) / 10,
  } satisfies ConnectionDraft;
}

function describePlace({ locality, stateProvince, country }: GbifSoundOccurrence) {
  const parts = [locality, stateProvince, country].filter((part) => part?.trim());
  return parts.length ? parts.join(", ") : null;
}

/** Keeps the date part of a GBIF event date or of each end of a GBIF date interval. */
function toIsoDate(eventDate: string | undefined) {
  if (!eventDate) return null;
  const ends = [...new Set(eventDate.split("/").map((end) => end.slice(0, 10)))];
  return ends.join("/");
}

function toCoordinates({ decimalLatitude, decimalLongitude }: GbifSoundOccurrence) {
  if (decimalLatitude === undefined || decimalLongitude === undefined) return null;
  return { latitude: decimalLatitude, longitude: decimalLongitude } satisfies Coordinates;
}

function toGbifHints(occurrence: GbifSoundOccurrence) {
  const hints: Record<string, string> = {};
  if (occurrence.kingdom) hints.kingdom = occurrence.kingdom;
  if (occurrence.class) hints.class = occurrence.class;
  return hints;
}
