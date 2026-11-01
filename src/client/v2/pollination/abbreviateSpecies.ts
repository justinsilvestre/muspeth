/**
 * Shortens a scientific name for a label, as "A. mellifera" for "Apis mellifera".
 * A name whose second word is a placeholder such as "sp." keeps its genus in full, and any further words are dropped.
 */
export function abbreviateSpecies(name: string) {
  const [genus = "", epithet] = name.split(/\s+/);
  if (!epithet) return genus;
  if (/^sp\d*\.?$/i.test(epithet)) return `${genus} ${epithet}`;
  return `${genus[0]}. ${epithet}`;
}
