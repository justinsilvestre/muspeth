import type { NodeKind, NodeMedia } from "../../shared/graph";
import { MediaCredit } from "./MediaCredit";
import { resizeCommonsImage } from "./resizeCommonsImage";

type NodeFigureProps = {
  media: NodeMedia;
  kind: NodeKind | undefined;
  name: string;
};

/** Shows the image of the node whose page is open, or plays its sound for a recording, credited beneath. */
export function NodeFigure({ media, kind, name }: NodeFigureProps) {
  const isRecording = kind === "recording";
  return (
    <figure className={isRecording ? "w-56 shrink-0 sm:w-64" : "w-28 shrink-0 sm:w-32"}>
      {isRecording ? (
        // biome-ignore lint/a11y/useMediaCaption: Field recordings hold no speech; the node's name describes the sound.
        <audio controls preload="none" src={media.url} aria-label={name} className="w-full" />
      ) : (
        <img
          src={resizeCommonsImage(media.url, 330)}
          alt={name}
          className="aspect-square w-full rounded border border-line bg-subtle object-cover"
        />
      )}
      <figcaption className="mt-1 line-clamp-3 break-words text-muted text-xs">
        <MediaCredit media={media} />
      </figcaption>
    </figure>
  );
}
