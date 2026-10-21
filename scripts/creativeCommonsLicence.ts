const deedPattern =
  /creativecommons\.org\/licenses\/((?:by|nc|sa|nd)(?:-(?:nc|sa|nd))*)\/(\d\.\d)/i;
const gbifCodePattern = /^CC_((?:BY|NC|SA|ND)(?:_(?:NC|SA|ND))*)_(\d)_(\d)$/;
const cc0Pattern = /publicdomain\/zero\/1\.0|^CC0_1_0$/i;

/**
 * Gives the SPDX identifier of a Creative Commons licence, such as "CC-BY-NC-4.0",
 * from the address of its deed or legal code or from GBIF's code for it, such as "CC_BY_NC_4_0".
 * Gives null for anything else.
 */
export function toCreativeCommonsLicence(licence: string | undefined) {
  if (!licence) return null;
  if (cc0Pattern.test(licence)) return "CC0-1.0";
  const deed = licence.match(deedPattern);
  if (deed) return `CC-${deed[1]?.toUpperCase()}-${deed[2]}`;
  const code = licence.match(gbifCodePattern);
  if (code) return `CC-${code[1]?.replaceAll("_", "-")}-${code[2]}.${code[3]}`;
  return null;
}
