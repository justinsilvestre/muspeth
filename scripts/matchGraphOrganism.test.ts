import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGbifMatch, fetchGbifMatchByKey } from "./gbifApi.ts";
import type { GbifMatch } from "./gbifTaxonomy.ts";
import { fetchGlobiTaxonPaths } from "./globiApi.ts";
import { matchGraphOrganism } from "./matchGraphOrganism.ts";

vi.mock("./gbifApi.ts", () => ({ fetchGbifMatch: vi.fn(), fetchGbifMatchByKey: vi.fn() }));
vi.mock("./globiApi.ts", () => ({ fetchGlobiTaxonPaths: vi.fn() }));

const wheat = { id: "wikidata:Q15645384", label: "Triticum aestivum" };
const acceptedWheat = {
  matchType: "EXACT",
  usageKey: 7795888,
  acceptedUsageKey: undefined,
  status: "ACCEPTED",
  kingdom: "Plantae",
} satisfies GbifMatch;
const doubtedWheat = {
  matchType: "EXACT",
  usageKey: 2706391,
  acceptedUsageKey: undefined,
  status: "DOUBTFUL",
  kingdom: "Plantae",
} satisfies GbifMatch;
const fungusAlternative = { matchType: "EXACT", usageKey: 1, kingdom: "Fungi", genus: "Agaricus" };
const plantAlternative = { matchType: "EXACT", usageKey: 2, kingdom: "Plantae", genus: "Triticum" };
const noMatch = {
  matchType: "NONE",
  alternatives: [fungusAlternative, plantAlternative],
} satisfies GbifMatch;
const triticum = { matchType: "EXACT", usageKey: 2706388, kingdom: "Plantae", genus: "Triticum" };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(fetchGlobiTaxonPaths).mockResolvedValue([]);
});

function stubKeyMatch(match: Awaited<ReturnType<typeof fetchGbifMatchByKey>>) {
  vi.mocked(fetchGbifMatchByKey).mockResolvedValue(match);
}

function stubNameMatches(matchesByName: Record<string, GbifMatch>) {
  vi.mocked(fetchGbifMatch).mockImplementation(
    async (name) => matchesByName[name] ?? { matchType: "NONE" },
  );
}

function stubGlobiPath(names: string) {
  vi.mocked(fetchGlobiTaxonPaths).mockResolvedValue([{ names, ranks: null }]);
}

describe("matchGraphOrganism", () => {
  describe("when GBIF trusts the node's key", () => {
    it("returns the match for the key", async () => {
      stubKeyMatch(acceptedWheat);
      expect(await matchGraphOrganism(wheat, 7795888)).toBe(acceptedWheat);
    });

    it("does not match the name", async () => {
      stubKeyMatch(acceptedWheat);
      await matchGraphOrganism(wheat, 7795888);
      expect(fetchGbifMatch).not.toHaveBeenCalled();
    });
  });

  describe("when GBIF doubts the node's key", () => {
    it("matches the name within the kingdom of the key", async () => {
      stubKeyMatch(doubtedWheat);
      stubNameMatches({ "Triticum aestivum": acceptedWheat });
      await matchGraphOrganism(wheat, 2706391);
      expect(fetchGbifMatch).toHaveBeenCalledWith("Triticum aestivum", {
        verbose: "true",
        kingdom: "Plantae",
      });
    });

    it("returns the match for the name", async () => {
      stubKeyMatch(doubtedWheat);
      stubNameMatches({ "Triticum aestivum": acceptedWheat });
      expect(await matchGraphOrganism(wheat, 2706391)).toBe(acceptedWheat);
    });

    it("returns the doubted match when nothing else matches", async () => {
      stubKeyMatch(doubtedWheat);
      stubNameMatches({});
      expect(await matchGraphOrganism(wheat, 2706391)).toBe(doubtedWheat);
    });
  });

  describe("when GBIF no longer has the node's key", () => {
    it("returns the match for the name", async () => {
      stubKeyMatch(null);
      stubNameMatches({ "Triticum aestivum": acceptedWheat });
      expect(await matchGraphOrganism(wheat, 2706391)).toBe(acceptedWheat);
    });
  });

  describe("when the node has no key", () => {
    it("returns the match for the name", async () => {
      stubNameMatches({ "Triticum aestivum": acceptedWheat });
      expect(await matchGraphOrganism(wheat, null)).toBe(acceptedWheat);
    });

    it("does not look up a key", async () => {
      stubNameMatches({ "Triticum aestivum": acceptedWheat });
      await matchGraphOrganism(wheat, null);
      expect(fetchGbifMatchByKey).not.toHaveBeenCalled();
    });

    it("returns the alternative that fits GloBI's lineage when the name is ambiguous", async () => {
      stubNameMatches({ "Triticum aestivum": noMatch });
      stubGlobiPath("Plantae | Triticum | Triticum aestivum");
      expect(await matchGraphOrganism(wheat, null)).toMatchObject({
        usageKey: 2,
      });
    });

    it("returns the nearest ancestor GBIF knows when no alternative fits", async () => {
      stubNameMatches({
        "Triticum aestivum": { matchType: "NONE" },
        Triticum: triticum,
      });
      stubGlobiPath("Plantae | Triticum | Triticum aestivum");
      expect(await matchGraphOrganism(wheat, null)).toMatchObject({
        usageKey: 2706388,
        matchType: "HIGHERRANK",
      });
    });

    it("returns GBIF's empty match when nothing matches", async () => {
      stubNameMatches({ "Triticum aestivum": noMatch });
      expect(await matchGraphOrganism(wheat, null)).toBe(noMatch);
    });
  });
});
