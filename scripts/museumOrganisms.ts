import type { Ancestor, MuseumOrganism } from "./museumNames.ts";
import { fetchAncestorQids, fetchTaxonNames } from "./wikidataTaxonNamesApi.ts";

/** Gives the organisms the English common names and the ancestors that Wikidata knows for them. */
export async function addWikidataNames(organisms: MuseumOrganism[]) {
  const organismQids = organisms.flatMap(({ id }) => toQid(id));
  const ancestorQidsByOrganism = await fetchAncestorQids(organismQids);
  const allQids = [...organismQids, ...[...ancestorQidsByOrganism.values()].flat()];
  const names = await fetchTaxonNames(allQids);
  return organisms.map((organism) => {
    const [qid] = toQid(organism.id);
    const ancestors = (ancestorQidsByOrganism.get(qid ?? "") ?? []).map((ancestorQid) => ({
      qid: ancestorQid,
      names: listNames(names.get(ancestorQid)),
    })) satisfies Ancestor[];
    const wikidataNames = listNames(names.get(qid ?? ""));
    return { ...organism, englishNames: [...organism.englishNames, ...wikidataNames], ancestors };
  });
}

function toQid(nodeId: string) {
  const qid = nodeId.match(/^wikidata:(Q\d+)$/)?.[1];
  return qid ? [qid] : [];
}

/** Keeps single names: Wikidata sometimes lists a whole group of names as one value. */
function listNames(names: string[] | undefined) {
  return (names ?? []).filter((name) => name !== "" && !name.includes(","));
}
