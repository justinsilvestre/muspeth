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

function guildOf(supporters: string[]) {
  return {
    members: ["Daucus carota", "Lotus corniculatus"],
    support: supporters.length,
    supporters,
    cohesiveness: 0.5,
    subgroupiness: 0.5,
  };
}

describe("GuildTooltip", () => {
  it("names a membrane's plants and the visitor seen on exactly them", () => {
    render(
      <GuildTooltip
        hovered={{ kind: "subgroup", subgroup: guildOf(["Apis mellifera"]) }}
        pointer={pointer}
        set={set}
        relation={relations.visitors}
        sharedCounts={new Map()}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toBe(
      "D. carota, L. corniculatusA. mellifera was seen on exactly these plants.cohesiveness 0.50 · subgroupiness 0.5",
    );
  });

  it("names the first few molecules and counts the rest", () => {
    const molecules = ["a", "b", "c", "d", "e", "f", "g", "h"];
    render(
      <GuildTooltip
        hovered={{ kind: "subgroup", subgroup: guildOf(molecules) }}
        pointer={pointer}
        set={set}
        relation={relations.compounds}
        sharedCounts={new Map()}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toContain(
      "a, b, c, d, e, f and 2 molecules more are found in exactly these plants.",
    );
  });

  it("names a dot with the count of what it shares", () => {
    render(
      <GuildTooltip
        hovered={{ kind: "language", name: "Daucus carota" }}
        pointer={pointer}
        set={set}
        relation={relations.compounds}
        sharedCounts={new Map([["Daucus carota", 3]])}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toBe("Daucus carotacontains 3 molecules");
  });
});
