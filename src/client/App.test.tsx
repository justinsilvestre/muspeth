import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RankedPath } from "../shared/findPaths";
import type { Connection, GraphNode } from "../shared/graph";
import type { GraphEdge } from "../shared/graphExport";
import type { PlacedConnection } from "../shared/placeAndPeriodQuery";
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
  taxonomicLevel: "species",
  weight: null,
  place: null,
  latitude: null,
  longitude: null,
  date: null,
  source: "test",
  licence: "CC0-1.0",
  qualityFlags: [],
  sources: [
    {
      datasetId: "test/eppo",
      datasetCitation: "EPPO Global Database.",
      studyCitation: "Mamiya 1983. doi:10.1146/annurev.py.21.090183.001221",
      studyUrl: "https://doi.org/10.1146/annurev.py.21.090183.001221",
      recordCount: 3,
    },
    {
      datasetId: "test/eppo",
      datasetCitation: "EPPO Global Database.",
      studyCitation: "Futai 2013.",
      studyUrl: "https://example.org/futai",
      recordCount: 1,
    },
  ],
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

const pathogenEdge = {
  id: 1,
  sourceNodeId: "nematode",
  targetNodeId: "pine",
  kind: "interaction",
  relation: "pathogenOf",
  basis: "observed",
  source: "test",
  licence: "CC0-1.0",
  qualityFlags: [],
} satisfies GraphEdge;

const pathFromNematode = {
  nodeIds: ["nematode", "pine"],
  steps: [{ fromNodeId: "nematode", toNodeId: "pine", connections: [pathogenEdge] }],
  kinds: ["interaction"],
  neighborCounts: [1, 1],
  cost: 1,
} satisfies RankedPath;

const pathogenInKyoto = {
  ...pathogenEdge,
  place: "Kyoto",
  latitude: 35.03,
  longitude: 135.78,
  date: "1990/1992",
  licence: "CC0-1.0",
  distanceKm: null,
} satisfies PlacedConnection;

const responsesByPathname = {
  "/api/nodes": { nodes: [pine, nematode] },
  "/api/sources": { sources: ["test"] },
  "/api/paths": { paths: [pathFromNematode], truncated: false },
  "/api/connections": { connections: [pathogenInKyoto] },
  "/api/connections/dates": { dates: [{ date: "1990/1992", kind: "interaction", count: 1 }] },
  "/api/connections/places": {
    places: [{ place: "Kyoto", latitude: 35.03, longitude: 135.78, kind: "interaction", count: 1 }],
  },
  "/api/taxonomy": { taxa: [pinus], placements: [pinePlacement] },
} satisfies Record<string, unknown>;

/** Answers each API request with sample data, returning the stub so that tests can inspect requests. */
function stubApi() {
  const fetch = vi.fn(async (path: string) => {
    const pathname = path.split("?")[0] as keyof typeof responsesByPathname;
    return Response.json(responsesByPathname[pathname] ?? { connections: [pathogenOfPine] });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

function listRequestedPaths(fetch: ReturnType<typeof stubApi>) {
  return fetch.mock.calls.map(([path]) => path);
}

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ColorSchemeProvider>
        <App />
      </ColorSchemeProvider>
    </MemoryRouter>,
  );
}

async function searchForNode(query: string) {
  fireEvent.change(await screen.findByRole("searchbox", { name: "Search nodes" }), {
    target: { value: query },
  });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("finds a node by name", async () => {
    stubApi();
    renderApp();
    await searchForNode("nematode");
    expect(await screen.findByRole("link", { name: /pinewood nematode/ })).toBeDefined();
  });

  describe("when an organism is chosen", () => {
    it("shows its connections, with each end named", async () => {
      stubApi();
      renderApp();
      await searchForNode("red pine");
      fireEvent.click(await screen.findByRole("link", { name: /Japanese red pine/ }));
      const connections = await screen.findByRole("region", { name: /Connections of/ });
      const [connection] = await within(connections).findAllByRole("listitem");
      expect(connection?.textContent).toMatch(/^pinewood nematode pathogen of Japanese red pine/);
    });
  });

  describe("when a connection's sources are opened", () => {
    it("links each citation's DOI", async () => {
      stubApi();
      renderApp("/organisms/pine");
      fireEvent.click(await screen.findByText("Sources"));
      expect(screen.getByRole("link", { name: /^doi:10\.1146/ }).getAttribute("href")).toBe(
        "https://doi.org/10.1146/annurev.py.21.090183.001221",
      );
    });

    it("names the dataset of each study once", async () => {
      stubApi();
      renderApp("/organisms/pine");
      fireEvent.click(await screen.findByText("Sources"));
      expect(screen.getAllByText(/EPPO Global Database/)).toHaveLength(1);
    });

    it("links a study whose citation has no link of its own", async () => {
      stubApi();
      renderApp("/organisms/pine");
      fireEvent.click(await screen.findByText("Sources"));
      expect(screen.getByRole("link", { name: "View study" }).getAttribute("href")).toBe(
        "https://example.org/futai",
      );
    });

    it("counts the records behind each study", async () => {
      stubApi();
      renderApp("/organisms/pine");
      fireEvent.click(await screen.findByText("Sources"));
      expect(screen.getByText(/Mamiya 1983/).closest("li")?.textContent).toMatch(/3 records$/);
    });
  });

  describe("at an organism's address", () => {
    it("shows that organism's connections", async () => {
      stubApi();
      renderApp("/organisms/pine");
      expect(
        await screen.findByRole("region", { name: "Connections of Japanese red pine" }),
      ).toBeDefined();
    });
  });

  describe("when a kind of connection is checked", () => {
    it("asks for connections of that kind only", async () => {
      const fetch = stubApi();
      renderApp("/organisms/pine");
      fireEvent.click(await screen.findByText("Filters"));
      fireEvent.click(screen.getByRole("checkbox", { name: "likeness" }));
      expect(listRequestedPaths(fetch)).toContain("/api/nodes/pine/connections?kind=likeness");
    });
  });

  describe("when connections with a quality flag are hidden", () => {
    it("asks for connections without that flag", async () => {
      const fetch = stubApi();
      renderApp("/organisms/pine");
      fireEvent.click(await screen.findByText("Filters"));
      fireEvent.change(screen.getByRole("combobox", { name: "suspected error" }), {
        target: { value: "hide" },
      });
      expect(listRequestedPaths(fetch)).toContain(
        "/api/nodes/pine/connections?notFlaggedWith=suspected_error",
      );
    });
  });

  describe("at an organism's address with filters", () => {
    it("asks for the filtered connections", async () => {
      const fetch = stubApi();
      renderApp("/organisms/pine?basis=computed");
      await screen.findByText("pathogen of");
      expect(listRequestedPaths(fetch)).toContain("/api/nodes/pine/connections?basis=computed");
    });

    it("keeps the filters when another organism is chosen", async () => {
      stubApi();
      renderApp("/organisms/pine?basis=computed");
      await searchForNode("nematode");
      const links = await screen.findAllByRole("link", { name: /pinewood nematode/ });
      expect(links.map((link) => link.getAttribute("href"))).toContain(
        "/organisms/nematode?basis=computed",
      );
    });
  });

  describe("at an address with an invalid filter", () => {
    it("says what it could not read", async () => {
      stubApi();
      renderApp("/organisms/pine?kind=friendship");
      expect((await screen.findByRole("alert")).textContent).toMatch(/Unknown kind "friendship"/);
    });
  });

  describe("at the address of paths between two organisms", () => {
    it("names the nodes along each path", async () => {
      stubApi();
      renderApp("/paths?from=nematode&to=pine");
      const paths = await screen.findByRole("list", { name: "Paths" });
      expect(within(paths).getByRole("heading").textContent).toBe(
        "1. pinewood nematode → Japanese red pine",
      );
    });

    it("states each step's connections", async () => {
      stubApi();
      renderApp("/paths?from=nematode&to=pine");
      const steps = await screen.findByRole("list", { name: "Steps of path 1" });
      expect(within(steps).getByRole("listitem").textContent).toMatch(
        /^pinewood nematode pathogen of Japanese red pine/,
      );
    });
  });

  describe("when two organisms are picked for a path", () => {
    it("asks for the paths between them", async () => {
      const fetch = stubApi();
      renderApp("/paths");
      const from = await screen.findByRole("combobox", { name: "From" });
      fireEvent.change(from, { target: { value: "nematode" } });
      fireEvent.keyDown(from, { key: "Enter" });
      const to = screen.getByRole("combobox", { name: "To" });
      fireEvent.change(to, { target: { value: "red pine" } });
      fireEvent.keyDown(to, { key: "Enter" });
      expect(listRequestedPaths(fetch)).toContain("/api/paths?from=nematode&to=pine");
    });
  });

  describe("at the address of a period", () => {
    it("lists the connections recorded then, with where and when", async () => {
      stubApi();
      renderApp("/places?from=1990");
      const connections = await screen.findByRole("list", {
        name: "Connections by place and period",
      });
      expect(within(connections).getByRole("listitem").textContent).toContain(
        "Kyoto · 35.03, 135.78 · 1990/1992",
      );
    });
  });

  describe("when a place is searched", () => {
    it("asks for the connections near it", async () => {
      const fetch = stubApi();
      renderApp("/places");
      fireEvent.change(await screen.findByRole("textbox", { name: "Latitude" }), {
        target: { value: "35.01" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: "Longitude" }), {
        target: { value: "135.77" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Search" }));
      expect(listRequestedPaths(fetch)).toContain("/api/connections?near=35.01%2C135.77");
    });
  });

  describe("at the address of places and periods", () => {
    it("asks for every place where connections were recorded within the period", async () => {
      const fetch = stubApi();
      renderApp("/places?near=35,135&from=1990");
      await screen.findByRole("list", { name: "Connections by place and period" });
      expect(listRequestedPaths(fetch)).toContain("/api/connections/places?from=1990");
    });

    it("asks for every date on which connections were recorded near the place", async () => {
      const fetch = stubApi();
      renderApp("/places?near=35,135&from=1990");
      await screen.findByRole("list", { name: "Connections by place and period" });
      expect(listRequestedPaths(fetch)).toContain("/api/connections/dates?near=35%2C135");
    });

    it("searches a wider radius chosen on the slider", async () => {
      const fetch = stubApi();
      renderApp("/places?near=35,135");
      fireEvent.change(await screen.findByRole("slider", { name: /^Within/ }), {
        target: { value: "7" },
      });
      expect(listRequestedPaths(fetch)).toContain("/api/connections?near=35%2C135&radiusKm=250");
    });

    it("searches any time once the period is cleared", async () => {
      const fetch = stubApi();
      renderApp("/places?near=35,135&from=1990");
      fireEvent.click(await screen.findByRole("button", { name: "Search any time" }));
      expect(listRequestedPaths(fetch)).toContain("/api/connections?near=35%2C135");
    });
  });

  describe("at the taxonomy's address", () => {
    it("outlines the organisms within their taxa", async () => {
      stubApi();
      renderApp("/taxonomy");
      const outline = await screen.findByRole("list", { name: "Taxonomic tree outline" });
      expect(within(outline).getByText("genus Pinus").textContent).toMatch(/Japanese red pine$/);
    });
  });

  describe("when the taxonomic tree is chosen", () => {
    it("marks its link as the current page", async () => {
      stubApi();
      renderApp();
      fireEvent.click(screen.getByRole("link", { name: "Taxonomic tree" }));
      expect(
        screen.getByRole("link", { name: "Taxonomic tree" }).getAttribute("aria-current"),
      ).toBe("page");
    });
  });

  describe("at an unknown address", () => {
    it("says the page was not found", async () => {
      stubApi();
      renderApp("/nowhere");
      expect(await screen.findByRole("heading", { name: "Page not found" })).toBeDefined();
    });
  });

  describe("when the dark color scheme is chosen", () => {
    it("marks the page as dark", async () => {
      stubApi();
      renderApp();
      fireEvent.click(screen.getByRole("button", { name: "Dark", hidden: true }));
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("when the API fails", () => {
    it("shows an error", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response(null, { status: 500 })),
      );
      renderApp();
      expect(await screen.findByRole("alert")).toBeDefined();
    });
  });
});
