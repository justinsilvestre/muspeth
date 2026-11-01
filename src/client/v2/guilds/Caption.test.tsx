import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { BodySet } from "./BodySet";
import { Caption } from "./Caption";
import { relations } from "./relations";

afterEach(cleanup);

const set = {
  id: "test",
  name: "Flores, Azores: plants",
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
    expect(screen.getByText(/each membrane/).textContent).toBe(
      "3 plants, each membrane the plants that share a visitor. 1 visitor recorded, reaching 2 of the plants.",
    );
  });
});
