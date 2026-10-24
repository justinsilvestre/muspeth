import { describe, expect, it } from "vitest";
import { listNearestKin } from "./listNearestKin";

const ids = ["red pine", "black pine", "matsutake", "moss"];
const distances = [
  [0, 0.1, 0.6, 1],
  [0.1, 0, 0.7, 1],
  [0.6, 0.7, 0, 1],
  [1, 1, 1, 0],
];

describe("listNearestKin", () => {
  it("lists the closest organisms first", () => {
    expect(listNearestKin(ids, distances, "red pine", 2).map(({ id }) => id)).toEqual([
      "black pine",
      "matsutake",
    ]);
  });

  it("leaves out organisms that share nothing", () => {
    expect(listNearestKin(ids, distances, "moss", 3)).toEqual([]);
  });
});
