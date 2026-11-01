const licences: Record<string, { label: string; link?: string }> = {
  "CC0-1.0": { label: "CC0 1.0", link: "https://creativecommons.org/publicdomain/zero/1.0/" },
  "LicenseRef-web-of-life-attribution": { label: "Web of Life attribution" },
};

/** Matches the SPDX identifier of a Creative Commons licence other than CC0, such as "CC-BY-SA-4.0". */
const creativeCommonsPattern = /^CC-((?:BY|NC|SA|ND)(?:-(?:NC|SA|ND))*)-(\d\.\d)$/;

/** Names the licence of data or media for display, given its SPDX identifier. */
export function licenceLabel(licence: string) {
  const creativeCommons = licence.match(creativeCommonsPattern);
  if (creativeCommons) return `CC ${creativeCommons[1]} ${creativeCommons[2]}`;
  return licences[licence]?.label ?? licence;
}

/** Returns the address of a licence's deed, when it has a standard one. */
export function licenceLink(licence: string) {
  const creativeCommons = licence.match(creativeCommonsPattern);
  if (creativeCommons) {
    return `https://creativecommons.org/licenses/${creativeCommons[1]?.toLowerCase()}/${creativeCommons[2]}/`;
  }
  return licences[licence]?.link;
}
