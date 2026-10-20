import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Connection, GraphNode } from "../shared/graph";
import type { Taxon, TaxonPlacement } from "../shared/taxonomy";
import { App } from "./App";
import { ColorSchemeProvider } from "./theme/useColorScheme";

vi.mock("./taxonomy/TaxonTreeScene", () => ({ default: () => null }));

const pine = {
  id: "pine",
  kind: "organism",
  label: "Pinus densiflora",
  names: [{ language: "en", name: "Japanese red pine" }],
} satisfies GraphNode;

const nematode = {
  id: "nematode",
  kind: "organism",
  label: "Bursaphelenchus xylophilus",
  names: [{ language: "en", name: "pinewood nematode" }],
} satisfies GraphNode;

const pathogenOfPine = {
  id: 1,
  direction: "incoming",
  neighborId: "nematode",
  kind: "interaction",
  relation: "pathogenOf",
  basis: "observed",
  source: "test",
  citation: null,
  licence: "CC0-1.0",
  qualityFlags: [],
} satisfies Connection;

const pinus = {
  id: "pinus",
  parentId: null,
  rank: "genus",
  name: "Pinus",
} satisfies Taxon;

const pinePlacement = {
  nodeId: "pine",
  taxonId: "pinus",
  qualityFlags: [],
} satisfies TaxonPlacement;

const responsesByPath = {
  "/api/nodes": { nodes: [pine, nematode] },
  "/api/taxonomy": { taxa: [pinus], placements: [pinePlacement] },
} satisfies Record<string, unknown>;

function stubApi() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) =>
      Response.json(
        responsesByPath[path as keyof typeof responsesByPath] ?? { connections: [pathogenOfPine] },
      ),
    ),
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("lists the organisms", async () => {
    stubApi();
    render(<App />);
    expect(await screen.findByRole("button", { name: /pinewood nematode/ })).toBeDefined();
  });

  describe("when an organism is selected", () => {
    it("shows its connections, with each end named", async () => {
      stubApi();
      render(<App />);
      fireEvent.click(await screen.findByRole("button", { name: /Japanese red pine/ }));
      const connections = await screen.findByRole("region", { name: /Connections of/ });
      const [connection] = await within(connections).findAllByRole("listitem");
      expect(connection?.textContent).toMatch(/^pinewood nematode pathogenOf Japanese red pine/);
    });
  });

  describe("when the taxonomic tree is chosen", () => {
    it("outlines the organisms within their taxa", async () => {
      stubApi();
      render(<App />);
      fireEvent.click(await screen.findByRole("button", { name: "Taxonomic tree" }));
      const outline = await screen.findByRole("list", { name: "Taxonomic tree outline" });
      expect(within(outline).getByText("genus Pinus").textContent).toMatch(/Japanese red pine$/);
    });
  });

  describe("when the dark color scheme is chosen", () => {
    it("marks the page as dark", async () => {
      stubApi();
      render(
        <ColorSchemeProvider>
          <App />
        </ColorSchemeProvider>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Dark" }));
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("when the API fails", () => {
    it("shows an error", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response(null, { status: 500 })),
      );
      render(<App />);
      expect(await screen.findByRole("alert")).toBeDefined();
    });
  });
});
