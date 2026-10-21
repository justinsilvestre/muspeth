import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import type { GraphNode } from "../shared/graph";
import { NodeList } from "./NodeList";

function renderPine(names: GraphNode["names"]) {
  const pine = {
    id: "pine",
    kind: "organism",
    label: "Pinus densiflora",
    names,
  } satisfies GraphNode;
  render(
    <MemoryRouter>
      <NodeList nodes={[pine]} selectedNodeId={undefined} />
    </MemoryRouter>,
  );
  return screen.getByRole("link").textContent;
}

afterEach(cleanup);

describe("NodeList", () => {
  it("shows the English, scientific and Japanese names when all are known", () => {
    const names = [
      { language: "en", name: "Japanese red pine" },
      { language: "ja", name: "アカマツ" },
    ];
    expect(renderPine(names)).toBe("Japanese red pinePinus densiflora · アカマツ");
  });

  it("shows only the scientific name when no other name is known", () => {
    expect(renderPine([])).toBe("Pinus densiflora");
  });

  it("leaves out a Japanese name that repeats the scientific name", () => {
    const names = [
      { language: "en", name: "Japanese red pine" },
      { language: "ja", name: "Pinus densiflora" },
    ];
    expect(renderPine(names)).toBe("Japanese red pinePinus densiflora");
  });

  it("shows the Japanese name beneath the scientific name when there is no English name", () => {
    expect(renderPine([{ language: "ja", name: "アカマツ" }])).toBe("Pinus densifloraアカマツ");
  });

  it("leaves out an English name that repeats the scientific name", () => {
    expect(renderPine([{ language: "en", name: "Pinus densiflora" }])).toBe("Pinus densiflora");
  });
});
