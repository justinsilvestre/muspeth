import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { NodeLink } from "./NodeLink";

afterEach(cleanup);

function renderAt(address: string, element = <NodeLink nodeId="wikidata:Q1" name="matsutake" />) {
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/organisms/:nodeId" element={element} />
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("NodeLink", () => {
  it("links to the node's page", () => {
    renderAt("/paths");
    expect(screen.getByRole("link", { name: "matsutake" }).getAttribute("href")).toBe(
      "/organisms/wikidata%3AQ1",
    );
  });

  it("keeps the connection filter of the current address", () => {
    renderAt("/paths?kind=interaction&notFlaggedWith=suspected_error");
    expect(screen.getByRole("link", { name: "matsutake" }).getAttribute("href")).toBe(
      "/organisms/wikidata%3AQ1?kind=interaction&notFlaggedWith=suspected_error",
    );
  });

  it("drops the other parameters of the current address", () => {
    renderAt("/paths?from=a&to=b&basis=observed&near=35.5%2C138.3");
    expect(screen.getByRole("link", { name: "matsutake" }).getAttribute("href")).toBe(
      "/organisms/wikidata%3AQ1?basis=observed",
    );
  });

  describe("on the page of the node itself", () => {
    it("shows the name without a link", () => {
      renderAt("/organisms/wikidata%3AQ1");
      expect(screen.queryByRole("link")).toBeNull();
    });

    it("still shows the name", () => {
      renderAt("/organisms/wikidata%3AQ1");
      expect(screen.getByText("matsutake")).toBeDefined();
    });
  });

  describe("on the page of another node", () => {
    it("links to the node", () => {
      renderAt("/organisms/wikidata%3AQ2");
      expect(screen.getByRole("link", { name: "matsutake" })).toBeDefined();
    });
  });
});
