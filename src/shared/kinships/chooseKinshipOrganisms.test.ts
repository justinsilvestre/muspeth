import { describe, expect, it } from "vitest";
import { chooseKinshipOrganisms } from "./chooseKinshipOrganisms";

function candidate(id: string, className: string, connectionCount: number, kindCount = 4) {
  return { id, className, connectionCount, kindCount };
}

describe("chooseKinshipOrganisms", () => {
  it("keeps the organisms with the most connections in each class", () => {
    const chosen = chooseKinshipOrganisms(
      [candidate("a", "Insecta", 10), candidate("b", "Insecta", 30), candidate("c", "Insecta", 20)],
      { perClass: 2, max: 10, minKinds: 4 },
    );
    expect(chosen.sort()).toEqual(["b", "c"]);
  });

  it("favours organisms connected in more kinds over more connected ones", () => {
    const chosen = chooseKinshipOrganisms(
      [candidate("a", "Insecta", 90, 4), candidate("b", "Insecta", 10, 5)],
      { perClass: 1, max: 10, minKinds: 4 },
    );
    expect(chosen).toEqual(["b"]);
  });

  it("leaves out organisms with too few kinds of connection", () => {
    const chosen = chooseKinshipOrganisms([candidate("a", "Aves", 50, 3)], {
      perClass: 2,
      max: 10,
      minKinds: 4,
    });
    expect(chosen).toEqual([]);
  });

  it("chooses no more than the maximum, favouring the most connected", () => {
    const chosen = chooseKinshipOrganisms(
      [candidate("a", "Aves", 5), candidate("b", "Insecta", 50), candidate("c", "Pinopsida", 40)],
      { perClass: 2, max: 2, minKinds: 4 },
    );
    expect(chosen.sort()).toEqual(["b", "c"]);
  });
});
