import { describe, expect, it } from "vitest";
import { networks } from "./networks";

describe("networks", () => {
  it("gives every network a citation with a link", () => {
    expect(networks.every((network) => network.citation.url.startsWith("https://"))).toBe(true);
  });

  it("names only visitors and plants of the network in its visits", () => {
    const stray = networks.flatMap((network) => {
      const visitors = new Set(network.visitors.map(({ name }) => name));
      const plants = new Set(network.plants.map(({ name }) => name));
      return network.visits.filter(
        ({ visitor, plant }) => !visitors.has(visitor) || !plants.has(plant),
      );
    });
    expect(stray).toEqual([]);
  });
});
