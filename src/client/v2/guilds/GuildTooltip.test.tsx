import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { BodySet } from "./BodySet";
import { GuildTooltip } from "./GuildTooltip";
import { relations } from "./relations";

afterEach(cleanup);

const pointer = { x: 10, y: 20 };

const set = {
  id: "test",
  name: "Test",
  group: "Tests",
  description: "",
  bodyNoun: { one: "plant", many: "plants" },
  labelStyle: "species",
  bodies: [],
  sharings: [],
} satisfies BodySet;

describe("GuildTooltip", () => {
  it("names a guild by its abbreviated members and the partners holding it together", () => {
    const guild = {
      members: ["Daucus carota", "Lotus corniculatus"],
      support: 1,
      supporters: ["Apis mellifera"],
      cohesiveness: 0.5,
      subgroupiness: 0.5,
    };
    render(
      <GuildTooltip
        hovered={{ kind: "subgroup", subgroup: guild }}
        pointer={pointer}
        set={set}
        relation={relations.visitors}
        partnerCounts={new Map()}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toBe(
      "D. carota, L. corniculatusheld together by 1 visitor seen on exactly these: A. melliferacohesiveness 0.50 · subgroupiness 0.5",
    );
  });

  it("names a body with the count of its partners", () => {
    render(
      <GuildTooltip
        hovered={{ kind: "language", name: "Daucus carota" }}
        pointer={pointer}
        set={set}
        relation={relations.compounds}
        partnerCounts={new Map([["Daucus carota", 3]])}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toBe("Daucus carotacontains 3 compounds");
  });
});
