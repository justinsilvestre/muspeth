import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { defaultFamily } from "../glottometry/families";
import { defaultAppearance } from "./appearance";
import { DiagramKey } from "./DiagramKey";

afterEach(cleanup);

describe("DiagramKey", () => {
  it("cites the family's data source", () => {
    render(
      <DiagramKey family={defaultFamily} appearance={defaultAppearance} hovered={undefined} />,
    );
    expect(
      screen.getByRole("link", { name: defaultFamily.citation.text }).getAttribute("href"),
    ).toBe(defaultFamily.citation.url);
  });

  it("invites pointing at a membrane while none is pointed at", () => {
    render(
      <DiagramKey family={defaultFamily} appearance={defaultAppearance} hovered={undefined} />,
    );
    expect(screen.getByRole("status").textContent).toContain("Point at a membrane");
  });

  it("names the pointed-at subgroup with its scores", () => {
    const hovered = { members: ["ⓁA", "ⓁB"], support: 17, cohesiveness: 0.706, subgroupiness: 12 };
    render(<DiagramKey family={defaultFamily} appearance={defaultAppearance} hovered={hovered} />);
    expect(screen.getByRole("status").textContent).toBe(
      "Subgroup A B: 17 supporting innovations, cohesiveness 0.71, subgroupiness 12.0.",
    );
  });
});
