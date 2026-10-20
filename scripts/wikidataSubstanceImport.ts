import { toItemNodes, toSubstanceConnection } from "./substanceDrafts.ts";
import { fetchLabels, fetchRankQids, fetchWorks } from "./wikidataItemApi.ts";
import { fetchCompoundLinks, fetchProductLinks } from "./wikidataSubstanceApi.ts";

/** Fetches the compounds and products that Wikidata links to the organisms, as nodes and connections. */
export async function collectWikidataSubstances(organismQids: string[]) {
  const compoundLinks = await fetchCompoundLinks(organismQids);
  const links = [...compoundLinks, ...(await fetchProductLinks(organismQids))];
  const itemQids = links.map(({ itemQid }) => itemQid);
  const workQids = links.flatMap(({ reference }) => reference?.workQids ?? []);
  const labels = await fetchLabels(itemQids);
  const ranks = await fetchRankQids([...new Set(links.map(({ organismQid }) => organismQid))]);
  const works = await fetchWorks(workQids);
  return {
    nodes: toItemNodes(links, labels),
    connections: links.map((link) =>
      toSubstanceConnection(link, ranks.get(link.organismQid), works),
    ),
  };
}
