import type { Connection } from "../shared/graph";
import { sourceDisplayName } from "./sourceDisplayName";
import { splitCitationLinks } from "./splitCitationLinks";

type ConnectionSourcesProps = {
  connection: Connection;
};

export function ConnectionSources({ connection }: ConnectionSourcesProps) {
  const citations = connection.citation?.split("\n") ?? [];
  return (
    <details className="mt-1 text-sm">
      <summary className="cursor-pointer text-muted">Sources</summary>
      <p className="mt-1">From {sourceDisplayName(connection.source)}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {citations.map((citation) => (
          <li key={citation} className="break-words">
            {splitCitationLinks(citation).map((piece, index) =>
              piece.href ? (
                <a
                  // biome-ignore lint/suspicious/noArrayIndexKey: A citation's pieces never reorder.
                  key={index}
                  href={piece.href}
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {piece.text}
                </a>
              ) : (
                piece.text
              ),
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
