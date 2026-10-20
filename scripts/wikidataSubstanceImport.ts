import { dropUnlabelledLinks, toItemNodes, toSubstanceConnection } from "./substanceDrafts.ts";
import { fetchLabels, fetchRankQids, fetchWorks } from "./wikidataItemApi.ts";
import { fetchCompoundLinks, fetchProductLinks } from "./wikidataSubstanceApi.ts";

/** Fetches the compounds and products that Wikidata links to the organisms, as nodes and connections. */
export async function collectWikidataSubstances(organismQids: string[]) {
  const compoundLinks = await fetchCompoundLinks(organismQids);
  const allLinks = [...compoundLinks, ...(await fetchProductLinks(organismQids))];
  const labels = await fetchLabels(allLinks.map(({ itemQid }) => itemQid));
  const links = dropUnlabelledLinks(allLinks, labels);
  const workQids = links.flatMap(({ reference }) => reference?.workQids ?? []);
  const ranks = await fetchRankQids([...new Set(links.map(({ organismQid }) => organismQid))]);
  const works = await fetchWorks(workQids);
  return {
    nodes: toItemNodes(links, labels),
    connections: links.map((link) =>
      toSubstanceConnection(link, ranks.get(link.organismQid), works),
    ),
  };
}
