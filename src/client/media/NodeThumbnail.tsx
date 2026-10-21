import type { NodeKind, NodeMedia } from "../../shared/graph";
import { NodeKindShape } from "../graphics/NodeKindShape";
import { describeMediaCredit } from "./MediaCredit";
import { resizeCommonsImage } from "./resizeCommonsImage";

type NodeThumbnailProps = {
  media: NodeMedia | undefined;
  kind: NodeKind | undefined;
};

/**
 * Shows a small image of a node beside its name, or the shape of its kind when it has no image.
 * It is decorative, as the name beside it identifies the node.
 */
export function NodeThumbnail({ media, kind }: NodeThumbnailProps) {
  if (!media) {
    return (
      <svg aria-hidden="true" viewBox="-16 -16 32 32" className="size-8 shrink-0 rounded bg-subtle">
        <g className="opacity-40">
          <NodeKindShape kind={kind} at={{ x: 0, y: 0 }} />
        </g>
      </svg>
    );
  }
  return (
    <img
      src={resizeCommonsImage(media.url, 120)}
      alt=""
      title={describeMediaCredit(media)}
      loading="lazy"
      decoding="async"
      className="size-8 shrink-0 rounded bg-subtle object-cover"
    />
  );
}
