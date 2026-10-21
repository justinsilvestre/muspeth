import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { ConnectionSentence } from "./ConnectionSentence";

afterEach(cleanup);

function renderSentence() {
  const names: Record<string, string> = { pine: "Japanese red pine", fungus: "matsutake" };
  render(
    <MemoryRouter initialEntries={["/paths?from=pine&to=fungus&basis=observed"]}>
      <ConnectionSentence
        sourceId="fungus"
        relation="hasEctomycorrhizalHost"
        targetId="pine"
        nameOf={(id) => names[id] ?? id}
      />
    </MemoryRouter>,
  );
}

describe("ConnectionSentence", () => {
  it("reads the source, the relation in words and the target", () => {
    renderSentence();
    expect(screen.getByRole("paragraph").textContent).toBe(
      "matsutake has ectomycorrhizal host Japanese red pine",
    );
  });

  it("links the source to its page, keeping the filter", () => {
    renderSentence();
    expect(screen.getByRole("link", { name: "matsutake" }).getAttribute("href")).toBe(
      "/organisms/fungus?basis=observed",
    );
  });

  it("links the target to its page, keeping the filter", () => {
    renderSentence();
    expect(screen.getByRole("link", { name: "Japanese red pine" }).getAttribute("href")).toBe(
      "/organisms/pine?basis=observed",
    );
  });
});
