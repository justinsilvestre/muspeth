import { describe, expect, it } from "vitest";
import { hubNeighborCount, listRankingReasons } from "./listRankingReasons";

const quiet = hubNeighborCount - 1;

describe("listRankingReasons", () => {
  it("counts a single kind of connection", () => {
    expect(listRankingReasons({ kinds: ["interaction"], neighborCounts: [1, 1] })).toEqual([
      "crosses 1 kind of connection",
    ]);
  });

  it("counts several kinds of connection", () => {
    const reasons = listRankingReasons({
      kinds: ["interaction", "likeness"],
      neighborCounts: [1, quiet, 1],
    });
    expect(reasons[0]).toBe("crosses 2 kinds of connection");
  });

  describe("for a path through other nodes", () => {
    it("says that it avoids hubs when every node on the way has few neighbours", () => {
      const reasons = listRankingReasons({ kinds: ["likeness"], neighborCounts: [1, quiet, 1] });
      expect(reasons[1]).toBe("avoids hubs");
    });

    it("ignores how many neighbours its two ends have", () => {
      const reasons = listRankingReasons({ kinds: ["likeness"], neighborCounts: [500, 2, 500] });
      expect(reasons[1]).toBe("avoids hubs");
    });

    it("names the neighbours of a hub it passes through", () => {
      const reasons = listRankingReasons({ kinds: ["likeness"], neighborCounts: [1, 488, 1] });
      expect(reasons[1]).toBe("passes through a hub with 488 neighbours");
    });

    it("names the busiest of several hubs it passes through", () => {
      const reasons = listRankingReasons({
        kinds: ["likeness"],
        neighborCounts: [1, 30, quiet, 488, 1],
      });
      expect(reasons[1]).toBe("passes through 2 hubs, the busiest with 488 neighbours");
    });
  });
});
