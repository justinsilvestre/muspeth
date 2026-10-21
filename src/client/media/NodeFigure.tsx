import type { NodeMedia } from "../../shared/graph";
import { MediaCredit } from "./MediaCredit";
import { resizeCommonsImage } from "./resizeCommonsImage";

type NodeFigureProps = {
  media: NodeMedia;
  name: string;
};

/** Shows the image of the node whose page is open, credited beneath. */
export function NodeFigure({ media, name }: NodeFigureProps) {
  return (
    <figure className="w-28 shrink-0 sm:w-32">
      <img
        src={resizeCommonsImage(media.url, 330)}
        alt={name}
        className="aspect-square w-full rounded border border-line bg-subtle object-cover"
      />
      <figcaption className="mt-1 line-clamp-3 break-words text-muted text-xs">
        <MediaCredit media={media} />
      </figcaption>
    </figure>
  );
}
