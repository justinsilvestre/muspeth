import type { NodeMedia } from "./graphDrafts.ts";

/** The parts of a Wikimedia Commons file page, as the Commons API describes it, that imports read. */
export type CommonsFile = {
  title: string;
  imageinfo?: {
    /** A link to a smaller copy of the image, when one was asked for. */
    thumburl?: string;
    url: string;
    descriptionurl: string;
    extmetadata?: Partial<Record<CommonsMetadataField, { value: string }>>;
  }[];
};

/** The metadata fields to ask the Commons API for. */
export const commonsMetadataFields = [
  "License",
  "LicenseShortName",
  "Artist",
  "Credit",
  "NonFree",
] as const;

type CommonsMetadataField = (typeof commonsMetadataFields)[number];

/** The most characters of a credit kept, as some files credit long lists of sources. */
const maxCreditLength = 300;

/**
 * Gives the Commons file title, such as "File:Pinus densiflora.jpg", for an image link as Wikidata
 * gives it, such as "http://commons.wikimedia.org/wiki/Special:FilePath/Pinus%20densiflora.jpg".
 */
export function toCommonsFileTitle(imageUrl: string) {
  const name = decodeURIComponent(imageUrl.split("/Special:FilePath/").at(-1) ?? "");
  return `File:${name.replaceAll("_", " ")}`;
}

/**
 * Converts a Commons file into media that link to the file, under its licence and with its
 * author's credit. Gives nothing for a file whose licence is unknown or that Commons marks as not
 * free.
 */
export function toCommonsMedia({ imageinfo }: CommonsFile) {
  const [info] = imageinfo ?? [];
  const metadata = info?.extmetadata ?? {};
  const licence = toLicenceId(metadata.License?.value, metadata.LicenseShortName?.value);
  if (!info || !licence || metadata.NonFree?.value === "true") return null;
  const credit = toPlainText(metadata.Artist?.value ?? metadata.Credit?.value ?? "");
  return {
    url: stripQuery(info.thumburl ?? info.url),
    licence,
    credit: credit === "" ? null : credit.slice(0, maxCreditLength),
    pageUrl: info.descriptionurl,
  } satisfies NodeMedia;
}

/**
 * Gives the SPDX identifier of a Creative Commons licence, such as "CC-BY-SA-4.0" for Commons'
 * "cc-by-sa-4.0", or else Commons' own short name for the licence, such as "Public domain".
 */
export function toLicenceId(code: string | undefined, shortName: string | undefined) {
  const normalized = code?.trim().toLowerCase();
  if (normalized === "cc0") return "CC0-1.0";
  const creativeCommons = normalized?.match(/^cc-(by|by-sa)-(\d\.\d)$/);
  if (creativeCommons) return `CC-${creativeCommons[1]?.toUpperCase()}-${creativeCommons[2]}`;
  return shortName?.trim() || null;
}

/** Turns the HTML that Commons gives for an author or credit into plain text. */
export function toPlainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Removes the tracking parameters that the Commons API adds to image links. */
function stripQuery(url: string) {
  return url.split("?")[0] ?? url;
}
