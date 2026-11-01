import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { demoFamily } from "../glottometry/families";
import { HoverTooltip } from "./HoverTooltip";

afterEach(cleanup);

const pointer = { x: 10, y: 20 };

describe("HoverTooltip", () => {
  it("shows nothing while the pointer is on nothing", () => {
    render(<HoverTooltip hovered={undefined} pointer={pointer} family={demoFamily} />);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("names a subgroup by its labels with its scores", () => {
    const subgroup = { members: ["ⓁA", "ⓁB"], support: 17, cohesiveness: 0.706, subgroupiness: 12 };
    render(
      <HoverTooltip
        hovered={{ kind: "subgroup", subgroup }}
        pointer={pointer}
        family={demoFamily}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toBe(
      "A, B17 supporting innovations · cohesiveness 0.71 · subgroupiness 12.0",
    );
  });

  it("names a language with its label when the two differ", () => {
    render(
      <HoverTooltip
        hovered={{ kind: "language", name: "ⓁA" }}
        pointer={pointer}
        family={demoFamily}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toBe("ⓁA (A)");
  });

  it("sits beside the pointer", () => {
    render(
      <HoverTooltip
        hovered={{ kind: "language", name: "ⓁA" }}
        pointer={pointer}
        family={demoFamily}
      />,
    );
    expect(screen.getByRole("tooltip").style.left).toBe("24px");
  });
});
