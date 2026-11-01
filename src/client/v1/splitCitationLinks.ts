type CitationPiece = { text: string; href?: string };

const linkPattern = /(?:https?:\/\/|doi:10\.)\S+?(?=[.,;)\]]*(?:\s|$))/g;

/** Splits a citation into plain text and the URLs and DOIs within it, each with the address it links to. */
export function splitCitationLinks(citation: string) {
  const pieces: CitationPiece[] = [];
  let end = 0;
  for (const match of citation.matchAll(linkPattern)) {
    if (match.index > end) pieces.push({ text: citation.slice(end, match.index) });
    pieces.push({ text: match[0], href: toHref(match[0]) });
    end = match.index + match[0].length;
  }
  if (end < citation.length) pieces.push({ text: citation.slice(end) });
  return pieces;
}

function toHref(link: string) {
  return link.startsWith("doi:") ? `https://doi.org/${link.slice("doi:".length)}` : link;
}
