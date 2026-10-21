import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { GbifTaxon } from "./gbifTaxon.ts";
import {
  type GbifSoundOccurrence,
  type SoundRecording,
  toSoundRecording,
} from "./soundRecordings.ts";

const speciesRanks = ["SPECIES", "SUBSPECIES", "VARIETY", "FORM"];

/**
 * Gives the GBIF key to look up an organism's recordings by: its accepted taxon's key when it is a
 * species or below, or null for a higher taxon, whose recordings would be of other organisms.
 */
export function toRecordedTaxonKey(gbif: GbifTaxon | null) {
  if (!gbif?.rank || !speciesRanks.includes(gbif.rank)) return null;
  return gbif.acceptedKey ?? gbif.key;
}

/** Flags the doubts in how GBIF matched an organism whose recordings are looked up. */
export function toMatchFlags(gbif: GbifTaxon) {
  const flags = [
    gbif.matchType === "FUZZY" && "fuzzy_name_match",
    gbif.isSynonym && "synonym_name",
  ] satisfies (QualityFlag | false)[];
  return flags.filter((flag) => flag !== false);
}

/**
 * Chooses up to `count` recordings among GBIF's sound occurrences, each by a different recordist,
 * preferring those whose coordinates are known and otherwise keeping GBIF's order.
 */
export function chooseRecordings(occurrences: GbifSoundOccurrence[], count: number) {
  const recordings = occurrences.flatMap((occurrence) => toSoundRecording(occurrence) ?? []);
  const located = recordings.filter(({ coordinates }) => coordinates);
  const unlocated = recordings.filter(({ coordinates }) => !coordinates);
  const chosen: SoundRecording[] = [];
  for (const recording of [...located, ...unlocated]) {
    if (chosen.length === count) break;
    if (chosen.some(({ recordist }) => recordist === recording.recordist)) continue;
    chosen.push(recording);
  }
  return chosen;
}
