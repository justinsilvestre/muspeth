/** Turns a vocabulary term such as "shared_words_and_stories" into words for display. */
export function termLabel(term: string) {
  return term.replaceAll("_", " ");
}
