import { ExternalLink } from "./ExternalLink";
import { splitCitationLinks } from "./splitCitationLinks";

type CitationTextProps = {
  citation: string;
};

/** Shows a citation with its URLs and DOIs as links. */
export function CitationText({ citation }: CitationTextProps) {
  return splitCitationLinks(citation).map((piece, index) =>
    piece.href ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: A citation's pieces never reorder.
      <ExternalLink key={index} href={piece.href}>
        {piece.text}
      </ExternalLink>
    ) : (
      piece.text
    ),
  );
}
