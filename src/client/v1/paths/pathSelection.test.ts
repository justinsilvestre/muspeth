import { describe, expect, it } from "vitest";
import { listSelectedPathIndexes } from "./pathSelection";

const routes = [{ nodeIds: ["a", "b", "z"] }, { nodeIds: ["a", "c", "z"] }];

describe("listSelectedPathIndexes", () => {
  describe("when a path is selected", () => {
    it("gives that path's index", () => {
      expect([...listSelectedPathIndexes({ pathIndex: 1 }, routes)]).toEqual([1]);
    });
  });

  describe("when a node is selected", () => {
    it("gives the indexes of the paths through it", () => {
      expect([...listSelectedPathIndexes({ nodeId: "c" }, routes)]).toEqual([1]);
    });
  });
});
