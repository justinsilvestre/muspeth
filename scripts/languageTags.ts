/**
 * BCP 47 tags for the Glottolog languoids that WOLD most often names as donors of loanwords.
 * Other languoids, such as proto-languages and language families, get a private-use tag.
 */
const tagsByGlottocode: Record<string, string> = {
  ainu1240: "ain",
  amha1245: "am",
  avar1256: "av",
  bulg1262: "bg",
  cent1989: "km",
  copt1239: "cop",
  croa1245: "hr",
  czec1258: "cs",
  dutc1256: "nl",
  gree1276: "grc",
  haus1257: "ha",
  hebr1245: "he",
  hung1274: "hu",
  ital1282: "it",
  java1254: "jv",
  kore1280: "ko",
  laoo1244: "lo",
  lati1261: "la",
  mace1250: "mk",
  maor1246: "mi",
  mand1415: "zh",
  midd1344: "ltc",
  minn1241: "nan",
  mode1248: "el",
  nepa1252: "ne",
  noon1243: "non",
  nucl1235: "hy",
  nucl1301: "tr",
  nucl1302: "ka",
  oldc1244: "och",
  oldf1239: "fro",
  pali1273: "pi",
  plat1254: "mg",
  port1283: "pt",
  russ1263: "ru",
  sans1269: "sa",
  serb1264: "sr",
  slov1268: "sl",
  slov1269: "sk",
  stan1288: "es",
  stan1290: "fr",
  stan1293: "en",
  stan1295: "de",
  stan1306: "ms",
  stan1318: "ar",
  sund1252: "su",
  swah1253: "sw",
  tami1289: "ta",
  tokp1240: "tpi",
  ukra1253: "uk",
  wels1247: "cy",
  yoru1245: "yo",
  yuec1235: "yue",
};

/** Turns an ISO 639 code into its canonical BCP 47 tag, for example "jpn" into "ja". */
export function toLanguageTag(isoCode: string) {
  try {
    return isoCode ? (Intl.getCanonicalLocales(isoCode)[0] ?? null) : null;
  } catch {
    return null;
  }
}

/** Tags a Glottolog languoid, falling back to a private-use tag such as "und-x-nepa1252". */
export function toGlottologLanguageTag(glottocode: string, isoCode = "") {
  if (!glottocode && !isoCode) return null;
  return toLanguageTag(isoCode || tagsByGlottocode[glottocode] || `und-x-${glottocode}`);
}

/**
 * Tells whether a name is written in a script the language normally uses.
 * It rejects romanized names, such as "Aka-matsu" given as Japanese.
 */
export function isWrittenInScriptOf(name: string, languageTag: string) {
  const script = toLikelyScript(languageTag);
  return script === "Latn" || !/^[\p{Script=Latin}\P{L}]+$/u.test(name);
}

function toLikelyScript(languageTag: string) {
  try {
    return new Intl.Locale(languageTag).maximize().script ?? "Latn";
  } catch {
    return "Latn";
  }
}
