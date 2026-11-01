import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { demoFamily } from "../glottometry/families";
import { defaultAppearance } from "./appearance";
import { DiagramKey } from "./DiagramKey";

afterEach(cleanup);

describe("DiagramKey", () => {
  it("cites the family's data source", () => {
    render(<DiagramKey family={demoFamily} appearance={defaultAppearance} />);
    expect(screen.getByRole("link", { name: demoFamily.citation.text }).getAttribute("href")).toBe(
      demoFamily.citation.url,
    );
  });
});
