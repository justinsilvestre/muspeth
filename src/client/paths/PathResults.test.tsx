import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RankedPath } from "../../shared/findPaths";
import type { GraphEdge } from "../../shared/graphExport";
import { PathResults } from "./PathResults";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const names: Record<string, string> = { a: "matsutake", b: "Kyoto", c: "pine" };
const nameOf = (id: string) => names[id] ?? id;
const kindOf = () => "organism" as const;

const edge = {
  id: 1,
  sourceNodeId: "a",
  targetNodeId: "b",
  kind: "shared_place_and_sound",
  relation: "recordedAt",
  basis: "observed",
  source: "mangal",
  licence: "CC-BY-4.0",
  qualityFlags: [],
} satisfies GraphEdge;

const pathThroughKyoto = {
  nodeIds: ["a", "b", "c"],
  steps: [
    { fromNodeId: "a", toNodeId: "b", connections: [edge] },
    {
      fromNodeId: "b",
      toNodeId: "c",
      connections: [{ ...edge, id: 2, sourceNodeId: "b", targetNodeId: "c" }],
    },
  ],
  kinds: ["shared_place_and_sound"],
  neighborCounts: [1, 2, 1],
  cost: 2,
} satisfies RankedPath;

/** A direct path from matsutake to pine, with a connection stated each way. */
const directPath = {
  nodeIds: ["a", "c"],
  steps: [
    {
      fromNodeId: "a",
      toNodeId: "c",
      connections: [
        { ...edge, id: 3, sourceNodeId: "c", targetNodeId: "a", relation: "symbiontOf" },
        { ...edge, id: 4, sourceNodeId: "a", targetNodeId: "c", relation: "mutualistOf" },
        { ...edge, id: 5, sourceNodeId: "c", targetNodeId: "a", relation: "hostOf" },
      ],
    },
  ],
  kinds: ["shared_place_and_sound"],
  neighborCounts: [1, 1],
  cost: 1,
} satisfies RankedPath;

async function renderPaths(paths: RankedPath[]) {
  vi.stubGlobal("fetch", async () => Response.json({ paths, truncated: false, media: {} }));
  render(
    <MemoryRouter initialEntries={["/paths?from=a&to=c&source=mangal"]}>
      <PathResults
        params={new URLSearchParams("from=a&to=c&source=mangal")}
        nameOf={nameOf}
        kindOf={kindOf}
      />
    </MemoryRouter>,
  );
  return screen.findByRole("list", { name: "Paths" });
}

async function findStepsOfPath(rank: number) {
  return within(await screen.findByRole("list", { name: `Steps of path ${rank}` }));
}

describe("PathResults", () => {
  describe("when the search finds paths", () => {
    it("offers a button for each path, best first", async () => {
      const paths = await renderPaths([pathThroughKyoto, directPath]);
      expect(
        within(paths)
          .getAllByRole("button")
          .map((button) => button.textContent),
      ).toEqual(["Path 1 · 2 steps", "Path 2 · 1 step"]);
    });

    it("selects the best path at first", async () => {
      await renderPaths([pathThroughKyoto, directPath]);
      expect(await screen.findByRole("list", { name: "Steps of path 1" })).toBeTruthy();
    });

    it("shows the steps of the path the reader selects", async () => {
      await renderPaths([pathThroughKyoto, directPath]);
      fireEvent.click(screen.getByRole("button", { name: "Path 2 · 1 step" }));
      const steps = await findStepsOfPath(2);
      expect(steps.getAllByRole("listitem")).toHaveLength(1);
    });

    it("states each step of the selected path as a connection", async () => {
      await renderPaths([pathThroughKyoto]);
      const steps = await findStepsOfPath(1);
      expect(
        steps.getAllByRole("listitem").map((step) => step.querySelector("p")?.textContent),
      ).toEqual(["matsutake recorded at Kyoto", "Kyoto recorded at pine"]);
    });

    it("names the source and licence of each connection", async () => {
      await renderPaths([pathThroughKyoto]);
      expect(screen.getAllByText(/Mangal/)[0]?.textContent).toBe(
        "shared place and sound · observed · Mangal · CC BY 4.0",
      );
    });

    it("gives the reasons for the selected path's rank", async () => {
      await renderPaths([pathThroughKyoto]);
      expect(screen.getByText(/^crosses/).textContent).toBe(
        "crosses 1 kind of connection · avoids hubs",
      );
    });

    it("draws each node once, as a button", async () => {
      await renderPaths([pathThroughKyoto, directPath]);
      expect(screen.getAllByRole("button", { name: /neighbours?$/ })).toHaveLength(3);
    });
  });

  describe("when paths differ only by one node", () => {
    const pathThroughOsaka = {
      ...pathThroughKyoto,
      nodeIds: ["a", "o", "c"],
      steps: [
        { fromNodeId: "a", toNodeId: "o", connections: [{ ...edge, id: 6, targetNodeId: "o" }] },
        {
          fromNodeId: "o",
          toNodeId: "c",
          connections: [{ ...edge, id: 7, sourceNodeId: "o", targetNodeId: "c" }],
        },
      ],
    } satisfies RankedPath;

    it("offers them as one path with variants", async () => {
      const paths = await renderPaths([pathThroughKyoto, pathThroughOsaka]);
      expect(within(paths).getByRole("button").textContent).toBe("Path 1 · 2 steps · 2 variants");
    });

    it("names the other nodes of the variants", async () => {
      await renderPaths([pathThroughKyoto, pathThroughOsaka]);
      expect(screen.getByText(/^Also through/).parentElement?.textContent).toBe(
        "Also through o in place of Kyoto.",
      );
    });
  });

  describe("when the reader selects a node", () => {
    async function selectKyoto() {
      await renderPaths([pathThroughKyoto, directPath]);
      fireEvent.click(screen.getByRole("button", { name: /^Kyoto,/ }));
      return within(await screen.findByRole("region", { name: "Kyoto" }));
    }

    it("names the paths through it", async () => {
      expect((await selectKyoto()).getByText(/on path/).textContent).toBe(
        "organism · 2 neighbours · on path 1",
      );
    });

    it("offers a search from it to the same end, keeping the filter", async () => {
      const details = await selectKyoto();
      expect(details.getByRole("link", { name: "Find paths from here" }).getAttribute("href")).toBe(
        "/paths?from=b&to=c&source=mangal",
      );
    });
  });

  describe("when a step has several connections", () => {
    it("shows first the connection stated in the direction of the path", async () => {
      await renderPaths([directPath]);
      const steps = await findStepsOfPath(1);
      expect(steps.getByRole("listitem").textContent).toMatch(/^matsutake mutualist of pine/);
    });

    it("folds the other connections behind a disclosure", async () => {
      await renderPaths([directPath]);
      const steps = await findStepsOfPath(1);
      expect(steps.getByText("+2 more connections").tagName).toBe("SUMMARY");
    });
  });

  describe("when the search finds no path", () => {
    function renderNoPath(truncated: boolean) {
      vi.stubGlobal("fetch", async () => Response.json({ paths: [], truncated, media: {} }));
      render(
        <MemoryRouter>
          <PathResults
            params={new URLSearchParams("from=a&to=b")}
            nameOf={nameOf}
            kindOf={kindOf}
          />
        </MemoryRouter>,
      );
      return screen.findByRole("status");
    }

    describe("after leaving out some neighbours", () => {
      it("says that a path may still exist through a node with many neighbours", async () => {
        expect((await renderNoPath(true)).textContent).toMatch(
          /may still exist through a node with more than 100 neighbours/,
        );
      });
    });

    describe("after following every neighbour", () => {
      it("says that the nodes are not connected within the step limit", async () => {
        expect((await renderNoPath(false)).textContent).toBe(
          "These two nodes are not connected by any path of up to 4 steps.",
        );
      });
    });
  });
});
