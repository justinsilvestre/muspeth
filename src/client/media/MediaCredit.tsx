import type { NodeMedia } from "../../shared/graph";
import { ExternalLink } from "../ExternalLink";
import { licenceLabel, licenceLink } from "../licenceLabel";

/** Credits an image's author and names its licence, each linked to its page when known. */
export function MediaCredit({ media }: { media: NodeMedia }) {
  const author = media.credit ?? "Unknown author";
  const deed = licenceLink(media.licence);
  return (
    <>
      {media.pageUrl ? <ExternalLink href={media.pageUrl}>{author}</ExternalLink> : author}
      {" · "}
      {deed ? (
        <ExternalLink href={deed}>{licenceLabel(media.licence)}</ExternalLink>
      ) : (
        licenceLabel(media.licence)
      )}
    </>
  );
}

/** Credits an image in plain text, for a tooltip. */
export function describeMediaCredit(media: NodeMedia) {
  return `${media.credit ?? "Unknown author"} · ${licenceLabel(media.licence)}`;
}
