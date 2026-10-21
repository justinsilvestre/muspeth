import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ConnectionFilter, emptyConnectionFilter } from "../shared/connectionFilter";
import type { Connection, GraphNode, NodeMedia } from "../shared/graph";
import { ConnectionList } from "./ConnectionList";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const nodes = [
  {
    id: "fungus",
    kind: "organism",
    label: "Tricholoma",
    names: [{ language: "en", name: "matsutake" }],
  },
  { id: "pine", kind: "organism", label: "Pinus", names: [{ language: "en", name: "pine" }] },
  { id: "matsu", kind: "word", label: "マツ", names: [] },
] satisfies GraphNode[];

const hostConnection = {
  id: 1,
  direction: "outgoing",
  neighborId: "pine",
  kind: "interaction",
  relation: "hasEctomycorrhizalHost",
  basis: "observed",
  taxonomicLevel: null,
  weight: null,
  place: null,
  latitude: null,
  longitude: null,
  date: null,
  source: "mangal",
  licence: "CC-BY-4.0",
  qualityFlags: ["duplicate_network_copy"],
  sources: [],
} satisfies Connection;

const nameConnection = {
  ...hostConnection,
  id: 2,
  direction: "incoming",
  neighborId: "matsu",
  kind: "shared_words_and_stories",
  relation: "names",
  basis: "attributed",
  qualityFlags: [],
} satisfies Connection;

const eatenByConnection = {
  ...hostConnection,
  id: 3,
  relation: "eatenBy",
  qualityFlags: [],
} satisfies Connection;

function stubConnections(connections: Connection[], media: Record<string, NodeMedia> = {}) {
  vi.stubGlobal("fetch", async (path: string) =>
    Response.json(
      path.startsWith("/api/sources") ? { sources: ["mangal"] } : { connections, media },
    ),
  );
}

function imageOf(name: string) {
  return {
    url: `https://upload.wikimedia.org/${name}.jpg`,
    licence: "CC0-1.0",
    credit: null,
    pageUrl: null,
  } satisfies NodeMedia;
}

function renderConnectionsOfFungus(filter: ConnectionFilter = emptyConnectionFilter) {
  const listOf = (currentFilter: ConnectionFilter) => (
    <MemoryRouter initialEntries={["/organisms/fungus?kind=interaction&other=1"]}>
      <Routes>
        <Route
          path="/organisms/:nodeId"
          element={
            <ConnectionList
              nodeId="fungus"
              nodes={nodes}
              filter={currentFilter}
              onFilterChange={() => {}}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
  const { rerender } = render(listOf(filter));
  return (nextFilter: ConnectionFilter) => rerender(listOf(nextFilter));
}

function manyConnections() {
  return Array.from({ length: 61 }, (_, index) => ({
    ...hostConnection,
    id: index,
    kind: index === 0 ? "interaction" : "shared_words_and_stories",
  })) satisfies Connection[];
}

function findKindGroup(name: RegExp) {
  return screen.findByText(name, { selector: "summary" });
}

describe("ConnectionList", () => {
  it("counts the connections beneath the heading", async () => {
    stubConnections([hostConnection, nameConnection]);
    renderConnectionsOfFungus();
    expect(await screen.findByText("2 connections")).toBeDefined();
  });

  it("heads each kind with its count", async () => {
    stubConnections([hostConnection, nameConnection, eatenByConnection]);
    renderConnectionsOfFungus();
    expect((await findKindGroup(/^Interaction/)).textContent).toBe("Interaction · 2");
  });

  it("heads each relation with its count when a kind holds several", async () => {
    stubConnections([hostConnection, eatenByConnection]);
    renderConnectionsOfFungus();
    expect((await screen.findByRole("heading", { name: /eaten by/ })).textContent).toBe(
      "matsutake eaten by … · 1",
    );
  });

  it("puts the neighbour before the node in a relation's heading for incoming connections", async () => {
    stubConnections([nameConnection]);
    renderConnectionsOfFungus();
    expect((await screen.findByRole("heading", { name: /names/ })).textContent).toBe(
      "… names matsutake",
    );
  });

  it("opens every kind when the node has few connections", async () => {
    stubConnections([hostConnection, nameConnection]);
    renderConnectionsOfFungus();
    const group = await findKindGroup(/^Shared words and stories/);
    expect(group.closest("details")?.open).toBe(true);
  });

  it("closes every kind but the first when the node has many connections", async () => {
    stubConnections(manyConnections());
    renderConnectionsOfFungus();
    const groups = await screen.findAllByText(/^(Interaction|Shared words)/, {
      selector: "summary",
    });
    expect(groups.map((group) => group.closest("details")?.open)).toEqual([true, false]);
  });

  it("shows the node's image beside the heading", async () => {
    stubConnections([hostConnection], { fungus: imageOf("fungus") });
    renderConnectionsOfFungus();
    expect((await screen.findByRole("img", { name: "matsutake" })).getAttribute("src")).toBe(
      "https://upload.wikimedia.org/fungus.jpg",
    );
  });

  describe("in a connection", () => {
    it("shows the neighbour's image", async () => {
      stubConnections([hostConnection], { pine: imageOf("pine") });
      renderConnectionsOfFungus();
      const connection = await screen.findByRole("listitem");
      expect(connection.querySelector("img")?.getAttribute("src")).toBe(
        "https://upload.wikimedia.org/pine.jpg",
      );
    });

    it("states the relation in words, with the node's own name as plain text", async () => {
      stubConnections([hostConnection]);
      renderConnectionsOfFungus();
      const connection = await screen.findByRole("listitem");
      expect(within(connection).getAllByRole("paragraph")[0]?.textContent).toBe(
        "matsutake has ectomycorrhizal host pine",
      );
    });

    it("links the neighbour to its page, keeping only the filter", async () => {
      stubConnections([hostConnection]);
      renderConnectionsOfFungus();
      expect((await screen.findByRole("link", { name: "pine" })).getAttribute("href")).toBe(
        "/organisms/pine?kind=interaction",
      );
    });

    it("states the basis, source, licence and flags", async () => {
      stubConnections([hostConnection]);
      renderConnectionsOfFungus();
      const connection = await screen.findByRole("listitem");
      expect(connection.textContent).toMatch(
        /observed · Mangal · CC BY 4\.0 · flagged: duplicate network copy/,
      );
    });
  });

  describe("while a new filter's connections load", () => {
    it("keeps the previous list, marked as busy", async () => {
      stubConnections([hostConnection]);
      const changeFilter = renderConnectionsOfFungus();
      await screen.findByRole("listitem");
      vi.stubGlobal("fetch", () => new Promise(() => {}));
      changeFilter({ ...emptyConnectionFilter, bases: ["observed"] });
      expect(screen.getByRole("listitem").closest("[aria-busy='true']")).not.toBeNull();
    });
  });
});
