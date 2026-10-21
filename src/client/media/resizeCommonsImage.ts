/** Matches the width in the file name of a Commons thumbnail, such as "800px-" or "lossy-page1-800px-". */
const thumbnailWidthPattern =
  /^(https:\/\/(?:upload|thumb)\.wikimedia\.org\/.+\/thumb\/.+\/(?:[a-z0-9-]+-)?)\d+px-/;

/** The standard widths of Wikimedia thumbnails. Wikimedia refuses requests for other widths. */
export type CommonsThumbnailWidth = 120 | 250 | 330 | 500 | 960;

/**
 * Gives the address of a Wikimedia Commons thumbnail at another width, so that small images load less.
 * Any other address is returned unchanged.
 */
export function resizeCommonsImage(url: string, width: CommonsThumbnailWidth) {
  return url.replace(thumbnailWidthPattern, `$1${width}px-`);
}
