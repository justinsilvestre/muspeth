import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BodiesTooltip } from "./BodiesTooltip";
import type { BodySet } from "./BodySet";
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
    {
      id: "bee",
      name: "Apis mellifera",
      commonName: "Honey bee",
      image: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Apis_mellifera.jpg/960px-Apis_mellifera.jpg",
        credit: "B. Keeper",
        licence: "CC BY 4.0",
        pageUrl: null,
      },
    },
  ],
  sharings: [],
} satisfies BodySet;

function membraneOf(supporters: string[]) {
  return {
    members: ["Daucus carota", "Lotus corniculatus"],
    support: supporters.length,
    supporters,
    cohesiveness: 0.5,
    subgroupiness: 0.5,
  };
}

describe("BodiesTooltip", () => {
  it("says first which visitor holds a membrane together, then names its plants", () => {
    render(
      <BodiesTooltip
        hovered={{ kind: "subgroup", subgroup: membraneOf(["Apis mellifera"]) }}
        pointer={pointer}
        set={set}
        relation={relations.visitors}
        sharedCounts={new Map()}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toBe(
      "A. mellifera (Honey bee) visits these 2 plants and no other plant here.D. carota, L. corniculatuscohesiveness 0.50 · subgroupiness 0.5Photo: B. Keeper, CC BY 4.0",
    );
  });

  it("pictures the species holding a membrane together", () => {
    render(
      <BodiesTooltip
        hovered={{ kind: "subgroup", subgroup: membraneOf(["Apis mellifera"]) }}
        pointer={pointer}
        set={set}
        relation={relations.visitors}
        sharedCounts={new Map()}
      />,
    );
    expect(screen.getByRole("tooltip").querySelector("img")?.getAttribute("src")).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Apis_mellifera.jpg/500px-Apis_mellifera.jpg",
    );
  });

  it("shows no picture for a molecule holding a membrane together", () => {
    render(
      <BodiesTooltip
        hovered={{ kind: "subgroup", subgroup: membraneOf(["Apis mellifera"]) }}
        pointer={pointer}
        set={set}
        relation={relations.compounds}
        sharedCounts={new Map()}
      />,
    );
    expect(screen.getByRole("tooltip").querySelector("img")).toBeNull();
  });

  it("names the first few molecules and counts the rest", () => {
    const molecules = ["a", "b", "c", "d", "e", "f", "g", "h"];
    render(
      <BodiesTooltip
        hovered={{ kind: "subgroup", subgroup: membraneOf(molecules) }}
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
      <BodiesTooltip
        hovered={{ kind: "subgroup", subgroup: membraneOf(["Magnoliopsida (class)"]) }}
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

  it("names a dot by its scientific name, then its common name, with the count of what it shares", () => {
    render(
      <BodiesTooltip
        hovered={{ kind: "language", name: "Daucus carota" }}
        pointer={pointer}
        set={set}
        relation={relations.compounds}
        sharedCounts={new Map([["Daucus carota", 3]])}
      />,
    );
    expect(screen.getByRole("tooltip").textContent).toBe(
      "Daucus carotaQueen Anne's Lacecontains 3 moleculesPhoto: A. Painter, CC0",
    );
  });

  it("shows a dot's picture at a standard width", () => {
    render(
      <BodiesTooltip
        hovered={{ kind: "language", name: "Daucus carota" }}
        pointer={pointer}
        set={set}
        relation={relations.compounds}
        sharedCounts={new Map()}
      />,
    );
    expect(screen.getByRole("tooltip").querySelector("img")?.getAttribute("src")).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Daucus_carota.jpg/500px-Daucus_carota.jpg",
    );
  });
});
