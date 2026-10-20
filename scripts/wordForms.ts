/** A word form in one language, as a BCP 47 language tag. */
export type WordForm = { language: string; form: string };

const hanPattern = /\p{Script=Han}/u;
/** Scripts written without spaces between words, where a word is found inside a longer name. */
const unspacedPattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
/** The suffix that Chinese, Japanese and Korean names of genera end in. */
const genusSuffixPattern = /^(.+?)[属屬속]$/u;

/** Identifies a word node by its language and its form, ignoring case. */
export function toWordId({ language, form }: WordForm) {
  return `word:${language}:${normalizeForm(form)}`;
}

function normalizeForm(form: string) {
  return form.normalize("NFC").trim().toLowerCase();
}

/**
 * Gives the form by which a name can occur in other names.
 * A Chinese, Japanese or Korean name of a genus loses the suffix that marks it as a genus.
 * For example, "マツ属" (the genus Pinus) gives "マツ", which occurs in "アカマツ".
 */
export function toNameElement(name: string, rank: string) {
  if (rank !== "genus") return name;
  return name.match(genusSuffixPattern)?.[1] ?? name;
}

/**
 * Tells how a word occurs in a name of the same language: as the whole name ("exact"),
 * as a part of it ("contained"), or not at all.
 * In scripts written with spaces, a part must be one or more whole words.
 */
export function findWordInName(form: string, name: string) {
  const word = normalizeForm(form);
  const text = normalizeForm(name);
  if (word === text) return "exact";
  if (!isLongEnoughToFind(word)) return null;
  if (unspacedPattern.test(word)) return text.includes(word) ? "contained" : null;
  return containsSequence(tokenize(text), tokenize(word)) ? "contained" : null;
}

/**
 * Tells whether a form is long enough to be found inside other names without many accidents:
 * one Chinese character, two kana or Hangul syllables, or three letters in other scripts.
 */
function isLongEnoughToFind(form: string) {
  const length = [...form].length;
  if (hanPattern.test(form)) return length >= 1;
  return length >= (unspacedPattern.test(form) ? 2 : 3);
}

/** Splits text into lowercase words, treating hyphens and punctuation as breaks. */
export function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{M}\p{N}'’]+/u)
    .filter(Boolean);
}

/** Tells whether `part` occurs as a run of consecutive items in `whole`. */
export function containsSequence(whole: string[], part: string[]) {
  if (part.length === 0) return false;
  for (let start = 0; start + part.length <= whole.length; start++) {
    if (part.every((item, offset) => whole[start + offset] === item)) return true;
  }
  return false;
}
