import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { PathsView } from "./PathsView";

function organism(id: string, englishName: string) {
  return {
    id,
    kind: "organism",
    label: id,
    names: [{ language: "en", name: englishName }],
  } satisfies GraphNode;
}

const nodes = [organism("pine", "Japanese red pine"), organism("nematode", "pinewood nematode")];

function renderPaths(path: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ paths: [], sources: [] })),
  );
  render(
    <MemoryRouter initialEntries={[path]}>
      <PathsView nodes={nodes} />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PathsView", () => {
  describe("when the ends are swapped", () => {
    it("puts the To node in the From field", () => {
      renderPaths("/paths?from=nematode&to=pine");
      fireEvent.click(screen.getByRole("button", { name: "Swap From and To" }));
      expect(screen.getByRole<HTMLInputElement>("combobox", { name: "From" }).value).toBe(
        "Japanese red pine",
      );
    });

    it("leaves the From field empty when no To node was chosen", () => {
      renderPaths("/paths?from=nematode");
      fireEvent.click(screen.getByRole("button", { name: "Swap From and To" }));
      expect(screen.getByRole<HTMLInputElement>("combobox", { name: "From" }).value).toBe("");
    });
  });
});
