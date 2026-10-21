const licences: Record<string, { label: string; link?: string }> = {
  "CC0-1.0": { label: "CC0 1.0", link: "https://creativecommons.org/publicdomain/zero/1.0/" },
  "CC-BY-4.0": { label: "CC BY 4.0", link: "https://creativecommons.org/licenses/by/4.0/" },
  "LicenseRef-web-of-life-attribution": { label: "Web of Life attribution" },
};

/** Names the licence of a connection's data for display, given its SPDX identifier. */
export function licenceLabel(licence: string) {
  return licences[licence]?.label ?? licence;
}

/** Returns the address of a licence's deed, when it has a standard one. */
export function licenceLink(licence: string) {
  return licences[licence]?.link;
}
