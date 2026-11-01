import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { defaultFamily } from "../glottometry/families";
import { defaultAppearance } from "./appearance";
import { DiagramKey } from "./DiagramKey";

afterEach(cleanup);

describe("DiagramKey", () => {
  it("cites the family's data source", () => {
    render(<DiagramKey family={defaultFamily} appearance={defaultAppearance} />);
    expect(
      screen.getByRole("link", { name: defaultFamily.citation.text }).getAttribute("href"),
    ).toBe(defaultFamily.citation.url);
  });
});
