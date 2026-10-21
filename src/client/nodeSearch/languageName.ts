const languageNames = new Intl.DisplayNames(["en"], { type: "language", fallback: "none" });

/** Returns the English name of a BCP 47 language tag, or nothing when there is none. */
export function languageName(tag: string) {
  try {
    return languageNames.of(tag);
  } catch {
    // Tags such as "und-x-oldh1241", which name a language by its Glottolog code, are rejected.
    return undefined;
  }
}
