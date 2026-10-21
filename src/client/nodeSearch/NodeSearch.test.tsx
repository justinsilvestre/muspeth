import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { createNodeCatalog } from "./createNodeCatalog";
import { NodeSearch } from "./NodeSearch";
import { matchPageSize } from "./useShownMatchCount";

const matsutake = {
  id: "wikidata:Q509308",
  kind: "organism",
  label: "Tricholoma matsutake",
  names: [{ language: "en", name: "matsutake" }],
} satisfies GraphNode;

const octenol = {
  id: "octenol",
  kind: "compound",
  label: "1-octen-3-ol",
  names: [],
} satisfies GraphNode;

const compounds = Array.from(
  { length: matchPageSize + 1 },
  (_, index) =>
    ({
      id: `c${index}`,
      kind: "compound",
      label: `compound ${String(index).padStart(3, "0")}`,
      names: [],
    }) satisfies GraphNode,
);

function renderSearch(selectedNodeId?: string, nodes: GraphNode[] = [matsutake, octenol]) {
  render(
    <MemoryRouter initialEntries={["/?basis=observed"]}>
      <NodeSearch catalog={createNodeCatalog(nodes)} selectedNodeId={selectedNodeId} />
    </MemoryRouter>,
  );
}

/** Shows a page of compounds, short of the last one. */
function renderManyMatches() {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  renderSearch(undefined, compounds);
  search("compound");
}

function search(query: string) {
  fireEvent.change(screen.getByRole("searchbox", { name: "Search nodes" }), {
    target: { value: query },
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("NodeSearch", () => {
  describe("before anything is searched", () => {
    it("offers each kind that has nodes", () => {
      renderSearch();
      expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
        "Organisms · 1",
        "Compounds · 1",
      ]);
    });

    it("links examples of each kind", () => {
      renderSearch();
      expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
        "matsutake",
        "1-octen-3-ol",
      ]);
    });
  });

  describe("when a name is searched", () => {
    it("links the matching nodes, keeping the address's filters", () => {
      renderSearch();
      search("octen");
      expect(screen.getByRole("link").getAttribute("href")).toBe(
        "/organisms/octenol?basis=observed",
      );
    });

    it("counts the matches", () => {
      renderSearch();
      search("o");
      expect(screen.getByText("2 matching nodes.")).toBeDefined();
    });
  });

  describe("when more nodes match than are shown", () => {
    it("counts the shown matches among all of them", () => {
      renderManyMatches();
      expect(
        screen.getByText(`Showing ${matchPageSize} of ${matchPageSize + 1} matching nodes.`),
      ).toBeDefined();
    });

    it("offers to show the rest", () => {
      renderManyMatches();
      expect(screen.getByRole("button", { name: "Show 1 more" })).toBeDefined();
    });
  });

  describe("when more matches are asked for", () => {
    it("shows them", () => {
      renderManyMatches();
      fireEvent.click(screen.getByRole("button", { name: "Show 1 more" }));
      expect(screen.getAllByRole("link")).toHaveLength(matchPageSize + 1);
    });

    it("moves focus to the first of them", () => {
      renderManyMatches();
      fireEvent.click(screen.getByRole("button", { name: "Show 1 more" }));
      expect(document.activeElement?.textContent).toContain(`compound ${matchPageSize}`);
    });

    it("shows a single page again once the search changes", () => {
      renderManyMatches();
      fireEvent.click(screen.getByRole("button", { name: "Show 1 more" }));
      search("ompound");
      expect(screen.getAllByRole("link")).toHaveLength(matchPageSize);
    });
  });

  describe("when a kind is chosen", () => {
    it("keeps only nodes of that kind", () => {
      renderSearch();
      search("o");
      fireEvent.click(screen.getByRole("radio", { name: /compound/ }));
      expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("counts the matches of each kind", () => {
      renderSearch();
      search("matsu");
      expect(screen.getByRole("radio", { name: /compound/ }).parentElement?.textContent).toBe(
        "compound0",
      );
    });
  });

  describe("when a kind is chosen from the overview", () => {
    it("lists the nodes of that kind", () => {
      renderSearch();
      fireEvent.click(screen.getByRole("button", { name: /Compounds/ }));
      expect(screen.getByRole("link").textContent).toContain("1-octen-3-ol");
    });

    it("moves focus to the kind's choice", () => {
      renderSearch();
      fireEvent.click(screen.getByRole("button", { name: /Compounds/ }));
      expect(document.activeElement).toBe(screen.getByRole("radio", { name: /compound/ }));
    });
  });

  describe("when a node is selected", () => {
    it("shows it above the search", () => {
      renderSearch("octenol");
      expect(screen.getByText("Selected").parentElement?.textContent).toContain("1-octen-3-ol");
    });
  });
});
