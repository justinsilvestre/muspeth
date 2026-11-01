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
  bodies: [
    {
      id: "carrot",
      name: "Daucus carota",
      commonName: "Queen Anne's Lace",
      image: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Daucus_carota.jpg/960px-Daucus_carota.jpg",
        credit: "A. Painter",
        licence: "CC0",
        pageUrl: null,
      },
    },
  ],
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
      "D. carota, L. corniculatusA. mellifera visits these 2 plants and no other plant here.cohesiveness 0.50 · subgroupiness 0.5",
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
      "A, b, c, d, e, f and 2 molecules more occur in these 2 plants and no other plant here.",
    );
  });

  it("names a taxon with its rank first", () => {
    render(
      <GuildTooltip
        hovered={{ kind: "subgroup", subgroup: guildOf(["Magnoliopsida (class)"]) }}
        pointer={pointer}
        set={set}
        relation={relations.descent}
        sharedCounts={new Map()}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toContain(
      "The class Magnoliopsida holds these 2 plants and no other plant here.",
    );
  });

  it("names a dot by its common and scientific names with the count of what it shares", () => {
    render(
      <GuildTooltip
        hovered={{ kind: "language", name: "Daucus carota" }}
        pointer={pointer}
        set={set}
        relation={relations.compounds}
        sharedCounts={new Map([["Daucus carota", 3]])}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toBe(
      "Queen Anne's LaceDaucus carotacontains 3 moleculesPhoto: A. Painter, CC0",
    );
  });

  it("shows a dot's picture at a small standard width", () => {
    render(
      <GuildTooltip
        hovered={{ kind: "language", name: "Daucus carota" }}
        pointer={pointer}
        set={set}
        relation={relations.compounds}
        sharedCounts={new Map()}
      />,
    );
    expect(screen.getByRole("tooltip").querySelector("img")?.getAttribute("src")).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Daucus_carota.jpg/250px-Daucus_carota.jpg",
    );
  });
});
