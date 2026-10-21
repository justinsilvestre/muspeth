import type { Coordinates } from "../src/shared/distanceKm.ts";
import { fetchJsonPolitely } from "./fetchJsonPolitely.ts";
import { createRequestSpacer } from "./requestSpacer.ts";
import type { GbifSoundOccurrence } from "./soundRecordings.ts";

const searchUrl = "https://api.gbif.org/v1/occurrence/search";
/** GBIF limits occurrence searches more tightly than its other services. */
const waitForTurn = createRequestSpacer(500);

/** Fetches up to `limit` occurrences of a taxon that come with a sound, near a place if given. */
export async function fetchSoundOccurrences(
  taxonKey: number,
  limit: number,
  near?: { coordinates: Coordinates; radiusKm: number },
) {
  const params = new URLSearchParams({ taxonKey: String(taxonKey), limit: String(limit) });
  if (near) params.set("geoDistance", toGeoDistance(near.coordinates, near.radiusKm));
  const { results = [] } = (await search(params)) as { results?: GbifSoundOccurrence[] };
  return results;
}

/** Lists the keys of the species with the most recordings within `radiusKm` of a place. */
export async function fetchRecordedSpeciesKeysNear(
  coordinates: Coordinates,
  radiusKm: number,
  limit: number,
) {
  const params = new URLSearchParams({
    geoDistance: toGeoDistance(coordinates, radiusKm),
    limit: "0",
    facet: "speciesKey",
    facetLimit: String(limit),
  });
  const { facets = [] } = (await search(params)) as {
    facets?: { counts: { name: string }[] }[];
  };
  return (facets[0]?.counts ?? []).map(({ name }) => Number(name));
}

async function search(params: URLSearchParams) {
  params.set("mediaType", "Sound");
  return (await fetchJsonPolitely(`${searchUrl}?${params}`, waitForTurn)) ?? {};
}

function toGeoDistance({ latitude, longitude }: Coordinates, radiusKm: number) {
  return `${latitude},${longitude},${radiusKm}km`;
}
