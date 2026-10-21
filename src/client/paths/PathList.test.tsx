import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RankedPath } from "../../shared/findPaths";
import type { GraphEdge } from "../../shared/graphExport";
import { PathList } from "./PathList";

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
  vi.stubGlobal("fetch", async () => Response.json({ paths }));
  render(
    <MemoryRouter initialEntries={["/paths?from=a&to=c&source=mangal"]}>
      <PathList
        params={new URLSearchParams("from=a&to=c&source=mangal")}
        nameOf={nameOf}
        kindOf={kindOf}
      />
    </MemoryRouter>,
  );
  return screen.findByRole("list", { name: "Paths" });
}

async function renderPathThroughKyoto() {
  await renderPaths([pathThroughKyoto]);
  return within(await screen.findByRole("heading"));
}

async function findStepsOfPath(rank: number) {
  return within(await screen.findByRole("list", { name: `Steps of path ${rank}` }));
}

describe("PathList", () => {
  describe("when the search finds a path", () => {
    it("reads the path as its nodes joined by arrows", async () => {
      await renderPathThroughKyoto();
      expect((await screen.findByRole("heading")).textContent).toBe("1. matsutake → Kyoto → pine");
    });

    it("links each node of the path to its page, keeping the filter", async () => {
      const heading = await renderPathThroughKyoto();
      expect(heading.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
        "/organisms/a?source=mangal",
        "/organisms/b?source=mangal",
        "/organisms/c?source=mangal",
      ]);
    });

    it("names the source and licence of each connection", async () => {
      await renderPathThroughKyoto();
      expect(screen.getAllByText(/Mangal/)[0]?.textContent).toBe(
        "shared place and sound · observed · Mangal · CC BY 4.0",
      );
    });

    it("explains how paths are ranked", async () => {
      await renderPathThroughKyoto();
      expect(screen.getByText(/listed first/).textContent).toMatch(
        /fewer neighbours.*mix kinds of connection, are listed first/,
      );
    });

    it("gives the reasons for the path's rank", async () => {
      await renderPathThroughKyoto();
      expect(screen.getByText(/^2 steps/).textContent).toBe(
        "2 steps · crosses 1 kind of connection · avoids hubs",
      );
    });

    it("labels the kinds of connection the path crosses", async () => {
      await renderPathThroughKyoto();
      const kinds = screen.getByRole("list", { name: "Kinds of connection in path 1" });
      expect(
        within(kinds)
          .getAllByRole("listitem")
          .map((item) => item.textContent),
      ).toEqual(["shared place and sound"]);
    });

    it("names the node each step enters", async () => {
      await renderPathThroughKyoto();
      const steps = await findStepsOfPath(1);
      expect(
        steps.getAllByRole("listitem").map((step) => step.textContent?.match(/to \w+$/)?.[0]),
      ).toEqual(["to Kyoto", "to pine"]);
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
    it("says that a path may still exist through a node with many neighbours", async () => {
      vi.stubGlobal("fetch", async () => Response.json({ paths: [] }));
      render(
        <MemoryRouter>
          <PathList params={new URLSearchParams("from=a&to=b")} nameOf={nameOf} kindOf={kindOf} />
        </MemoryRouter>,
      );
      expect((await screen.findByRole("status")).textContent).toMatch(
        /may still exist through a node with more than 100 neighbours/,
      );
    });
  });
});
