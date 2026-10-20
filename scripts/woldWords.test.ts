import { describe, expect, it } from "vitest";
import type { FolkTaxonLink } from "./organismTaxa.ts";
import { cleanDonorWord, toWoldForm, toWoldImport, type WoldTables } from "./woldWords.ts";

const pinus = {
  nodeId: "pinus",
  gbifKey: 2684241,
  rank: "genus",
  lineage: { kingdom: "Plantae", genus: "Pinus" },
  connectionCount: 3,
};

function makeLink(overrides: Partial<FolkTaxonLink> = {}) {
  return {
    folkTaxon: {
      taxon: { kingdom: "Plantae", rank: "genus", name: "Pinus" },
      woldMeaningIds: ["8-64"],
      motifTerms: [],
    },
    organisms: [pinus],
    isPushedDown: false,
    ...overrides,
  } satisfies FolkTaxonLink;
}

function makeForm(overrides: Record<string, string> = {}) {
  return {
    ID: "Hawaiian-8-64-1",
    Language_ID: "Hawaiian",
    Parameter_ID: "8-64",
    Form: "paina",
    original_script: "",
    Borrowed: "1. clearly borrowed",
    Word_ID: "123",
    ...overrides,
  };
}

function makeTables(overrides: Partial<WoldTables> = {}) {
  return {
    languages: [{ ID: "Hawaiian", Glottocode: "hawa1245", ISO639P3code: "haw" }],
    forms: [makeForm()],
    borrowings: [
      {
        Target_Form_ID: "Hawaiian-8-64-1",
        Source_word: "pine",
        Source_languoid_glottocode: "stan1293",
        Source_certain: "yes",
      },
    ],
    ...overrides,
  } satisfies WoldTables;
}

function listLinks(tables: WoldTables, links = [makeLink()]) {
  return toWoldImport(tables, links).connections.map(
    ({ sourceNodeId, relation, targetNodeId }) => `${sourceNodeId} ${relation} ${targetNodeId}`,
  );
}

describe("toWoldImport", () => {
  it("links the folk taxon's organisms to the words for its meanings", () => {
    expect(listLinks(makeTables())).toContain("pinus named by word:haw:paina");
  });

  it("links a loanword to the word it was borrowed from", () => {
    expect(listLinks(makeTables())).toContain("word:haw:paina borrowed from word:en:pine");
  });

  it("records the folk taxon's rank as the taxonomic level", () => {
    const [naming] = toWoldImport(makeTables(), [makeLink()]).connections;
    expect(naming?.taxonomicLevel).toBe("genus");
  });

  it("flags a link pushed down below the folk taxon's rank", () => {
    const [naming] = toWoldImport(makeTables(), [makeLink({ isPushedDown: true })]).connections;
    expect(naming?.qualityFlags).toEqual(["derived_from_coarser_level"]);
  });

  it("cites the WOLD word", () => {
    const [naming] = toWoldImport(makeTables(), [makeLink()]).connections;
    expect(naming?.sources[0]?.studyUrl).toBe("https://wold.clld.org/word/123");
  });

  it("flags a borrowing that WOLD rates as perhaps borrowed", () => {
    const tables = makeTables({ forms: [makeForm({ Borrowed: "3. perhaps borrowed" })] });
    const borrowing = toWoldImport(tables, [makeLink()]).connections.find(
      ({ relation }) => relation === "borrowed from",
    );
    expect(borrowing?.qualityFlags).toEqual(["uncertain_borrowing"]);
  });

  it("does not link a word that WOLD finds little evidence of borrowing for", () => {
    const tables = makeTables({ forms: [makeForm({ Borrowed: "4. very little evidence" })] });
    expect(listLinks(tables)).toEqual(["pinus named by word:haw:paina"]);
  });

  it("skips a donor without a glottocode", () => {
    const tables = makeTables({
      borrowings: [
        { Target_Form_ID: "Hawaiian-8-64-1", Source_word: "x", Source_languoid_glottocode: "" },
      ],
    });
    expect(listLinks(tables)).toEqual(["pinus named by word:haw:paina"]);
  });

  it("skips meanings of other folk taxa", () => {
    const tables = makeTables({ forms: [makeForm({ Parameter_ID: "3-82" })] });
    expect(listLinks(tables)).toEqual([]);
  });

  it("adds a node for each word and donor word", () => {
    const { nodes } = toWoldImport(makeTables(), [makeLink()]);
    expect(nodes.map(({ id }) => id)).toEqual(["word:haw:paina", "word:en:pine"]);
  });

  it("lists every word form, for matching against names", () => {
    expect(toWoldImport(makeTables(), [makeLink()]).forms).toEqual([
      { language: "haw", form: "paina" },
      { language: "en", form: "pine" },
    ]);
  });
});

describe("toWoldForm", () => {
  it("prefers the word in its own script", () => {
    expect(toWoldForm({ Form: "matsu", original_script: "松" })).toBe("松");
  });

  it("keeps the first of several spellings", () => {
    expect(toWoldForm({ Form: "meushi", original_script: "牝牛、雌牛" })).toBe("牝牛");
  });

  it("writes underscores as spaces", () => {
    expect(toWoldForm({ Form: "nalo_meli", original_script: "" })).toBe("nalo meli");
  });
});

describe("cleanDonorWord", () => {
  it("drops notes in parentheses", () => {
    expect(cleanDonorWord("mógu (蘑菇)")).toBe("mógu");
  });

  it("keeps the first of several variants", () => {
    expect(cleanDonorWord("松, sōng")).toBe("松");
  });

  it("rejects a comment", () => {
    expect(cleanDonorWord("Febrés: “cachilla, el trigo")).toBeNull();
  });
});
