import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { NodeSummary } from "./NodeSummary";

function renderSummary(node: GraphNode) {
  render(<NodeSummary node={node} isNameShared={false} />);
}

const pine = {
  id: "pine",
  kind: "organism",
  label: "Pinus densiflora",
  names: [{ language: "en", name: "Japanese red pine" }],
} satisfies GraphNode;

afterEach(cleanup);

describe("NodeSummary", () => {
  it("italicises an organism's scientific label", () => {
    renderSummary(pine);
    expect(screen.getByText("Pinus densiflora").tagName).toBe("I");
  });

  it("does not italicise an English name", () => {
    renderSummary(pine);
    expect(screen.getByText("Japanese red pine").tagName).not.toBe("I");
  });

  it("does not italicise a compound's label", () => {
    renderSummary({ id: "c", kind: "compound", label: "pinene", names: [] });
    expect(screen.getByText("pinene").tagName).not.toBe("I");
  });

  it("names an artwork's kind", () => {
    renderSummary({ id: "a", kind: "cultural_object", label: "Pines", names: [] });
    expect(screen.getByText("artwork")).toBeDefined();
  });
});
