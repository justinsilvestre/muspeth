import { type CommonsFile, toCommonsMedia } from "./commonsMedia.ts";
import type { NodeMediaLink } from "./nodeMediaSql.ts";

/**
 * Links each organism to the image that its Wikidata item names (property P18), when that image
 * is on Wikimedia Commons under a known licence.
 */
export function toOrganismPhotoLinks(
  organisms: { id: string; qid: string }[],
  imageTitlesByQid: Map<string, string>,
  filesByTitle: Map<string, CommonsFile>,
) {
  return organisms.flatMap(({ id, qid }) => {
    const file = filesByTitle.get(imageTitlesByQid.get(qid) ?? "");
    const media = file && toCommonsMedia(file);
    return media ? [{ nodeId: id, media } satisfies NodeMediaLink] : [];
  });
}
