import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { BodySet } from "./BodySet";
import { Caption } from "./Caption";
import { relations } from "./relations";

afterEach(cleanup);

const set = {
  id: "test",
  name: "Plants of Flores, Azores",
  group: "Tests",
  description: "",
  bodyNoun: { one: "plant", many: "plants" },
  labelStyle: "species",
  bodies: [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
    { id: "c", name: "C" },
  ],
  sharings: [],
} satisfies BodySet;

describe("Caption", () => {
  it("says what the dots and membranes are and how far the relation reaches", () => {
    const table = {
      languages: ["A", "B", "C"],
      innovations: [{ label: "bee", members: new Set(["A", "B"]) }],
    };
    render(<Caption set={set} relation={relations.visitors} table={table} />);
    expect(screen.getByText(/Each dot/).textContent).toBe(
      "Each dot is a plant. Each membrane wraps the plants that one and the same visitor comes to. 1 visitor recorded; 2 of the 3 plants have a recorded visitor.",
    );
  });

  it("writes the article the dot's noun takes", () => {
    const organisms = { ...set, bodyNoun: { one: "organism", many: "organisms" } };
    const table = { languages: ["A", "B", "C"], innovations: [] };
    render(<Caption set={organisms} relation={relations.compounds} table={table} />);
    expect(screen.getByText(/Each dot/).textContent).toContain("Each dot is an organism.");
  });

  it("says so when the relation reaches every dot", () => {
    const table = {
      languages: ["A", "B", "C"],
      innovations: [{ label: "all", members: new Set(["A", "B", "C"]) }],
    };
    render(<Caption set={set} relation={relations.compounds} table={table} />);
    expect(screen.getByText(/Each dot/).textContent).toContain(
      "1 molecule recorded; every plant has a listed molecule.",
    );
  });
});
