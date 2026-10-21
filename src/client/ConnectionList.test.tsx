import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyConnectionFilter } from "../shared/connectionFilter";
import type { Connection, GraphNode } from "../shared/graph";
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

async function renderConnectionsOfFungus() {
  vi.stubGlobal("fetch", async (path: string) =>
    Response.json(
      path.startsWith("/api/sources") ? { sources: ["mangal"] } : { connections: [hostConnection] },
    ),
  );
  render(
    <MemoryRouter initialEntries={["/organisms/fungus?kind=interaction&other=1"]}>
      <Routes>
        <Route
          path="/organisms/:nodeId"
          element={
            <ConnectionList
              nodeId="fungus"
              nodes={nodes}
              filter={{ ...emptyConnectionFilter, kinds: ["interaction"] }}
              onFilterChange={() => {}}
            />
          }
        />
      </Routes>
    </MemoryRouter>,
  );
  return screen.findByRole("listitem");
}

describe("ConnectionList", () => {
  describe("on a node's own page", () => {
    it("shows the node's own name in each connection as plain text", async () => {
      const connection = await renderConnectionsOfFungus();
      expect(connection.querySelectorAll("a[href^='/organisms/fungus']")).toHaveLength(0);
    });

    it("links the neighbour to its page, keeping only the filter", async () => {
      await renderConnectionsOfFungus();
      expect(screen.getByRole("link", { name: "pine" }).getAttribute("href")).toBe(
        "/organisms/pine?kind=interaction",
      );
    });

    it("states the kind, basis, source, licence and flags of the connection", async () => {
      const connection = await renderConnectionsOfFungus();
      expect(connection.querySelectorAll("p")[1]?.textContent).toMatch(
        /^interaction · observed · Mangal · CC BY 4\.0 · flagged: duplicate network copy/,
      );
    });
  });
});
