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
  cost: 2,
} satisfies RankedPath;

async function renderPathThroughKyoto() {
  vi.stubGlobal("fetch", async () => Response.json({ paths: [pathThroughKyoto] }));
  render(
    <MemoryRouter initialEntries={["/paths?from=a&to=c&source=mangal"]}>
      <PathList params={new URLSearchParams("from=a&to=c&source=mangal")} nameOf={nameOf} />
    </MemoryRouter>,
  );
  return within(await screen.findByRole("heading"));
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
  });

  describe("when the search finds no path", () => {
    it("says that a path may still exist through a node with many neighbours", async () => {
      vi.stubGlobal("fetch", async () => Response.json({ paths: [] }));
      render(
        <MemoryRouter>
          <PathList params={new URLSearchParams("from=a&to=b")} nameOf={nameOf} />
        </MemoryRouter>,
      );
      expect((await screen.findByRole("status")).textContent).toMatch(
        /may still exist through a node with more than 100 neighbours/,
      );
    });
  });
});
