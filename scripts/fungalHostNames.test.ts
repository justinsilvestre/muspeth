import { describe, expect, it } from "vitest";
import { readAnimalCapacity, readHostName } from "./fungalHostNames.ts";

describe("readHostName", () => {
  it("reads a genus", () => {
    expect(readHostName("Eucalyptus ")?.name).toBe("Eucalyptus");
  });

  it("reads a family by its ending", () => {
    expect(readHostName("Pinaceae")?.rank).toBe("family");
  });

  it("reads a binomial as a species", () => {
    expect(readHostName("Leptodesmia_congesta")).toMatchObject({
      name: "Leptodesmia congesta",
      rank: "species",
    });
  });

  it("drops the part of the host that follows the name", () => {
    expect(readHostName("Pinaceae_needles")?.name).toBe("Pinaceae");
  });

  it("drops a part made of several words", () => {
    expect(readHostName("Pinus_galls_of_Cronartium")?.name).toBe("Pinus");
  });

  it("reads an informal group as the taxon covering it, keeping the group as an English name", () => {
    expect(readHostName("scale_insects")).toMatchObject({
      name: "Coccoidea",
      englishName: "scale insects",
      gbifHints: { kingdom: "Animalia", rank: "SUPERFAMILY" },
      qualityFlags: ["informal_group_name"],
    });
  });

  it("gives no host for a group that no taxon covers", () => {
    expect(readHostName("algae")).toBeNull();
  });

  it("gives no host for a name that is not a taxon", () => {
    expect(readHostName("various")).toBeNull();
  });
});

describe("readAnimalCapacity", () => {
  it("reads a termite symbiont as living on termites", () => {
    expect(readAnimalCapacity("termite_symbiont").map(({ host }) => host.name)).toEqual([
      "Termitidae",
    ]);
  });

  it("reads each of several capacities", () => {
    const names = readAnimalCapacity("animal_parasite/opportunistic_human_parasite").map(
      ({ host }) => host.name,
    );
    expect(names).toEqual(["Animalia", "Homo sapiens"]);
  });

  it("ignores a capacity that names no host", () => {
    expect(readAnimalCapacity("animal_endosymbiont")).toEqual([]);
  });
});
