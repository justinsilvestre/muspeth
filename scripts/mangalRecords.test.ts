import { describe, expect, it } from "vitest";
import { parseInteraction, parseNetwork, parseNode, parseReference } from "./mangalRecords.ts";

const networkRow = {
  id: 948,
  name: "kato_1993_19910901_948",
  date: "1991-09-01T00:00:00.000Z",
  geom: { type: "Point", coordinates: [138.3833, 35.5833] },
  description: "Flower and anthophilous insect interactions at Mt. Kushigata",
  dataset_id: 66,
};

const nodeRow = {
  id: 8476,
  original_name: "Bombus beaticola ",
  network_id: 948,
  taxonomy: { id: 2882, name: "Bombus beaticola", rank: "infraspecies", gbif: 1340411, ncbi: null },
};

const interactionRow = {
  node_from: 8475,
  node_to: 8840,
  date: "1991-09-01T00:00:00.000Z",
  type: "mutualism",
  value: 115,
  attribute: {
    name: "number of visit by a pollinator",
    description: "Individuals seen on a flower",
  },
};

describe("parseNetwork", () => {
  it("keeps only the day of its date", () => {
    expect(parseNetwork(networkRow).date).toBe("1991-09-01");
  });

  it("reads a missing geometry as null", () => {
    expect(parseNetwork({ ...networkRow, geom: null }).geometry).toBeNull();
  });

  it("rejects a row without an identifier", () => {
    expect(() => parseNetwork({ ...networkRow, id: "948" })).toThrow();
  });
});

describe("parseNode", () => {
  it("trims the original name", () => {
    expect(parseNode(nodeRow).originalName).toBe("Bombus beaticola");
  });

  it("calls Mangal's infraspecies rank a subspecies", () => {
    expect(parseNode(nodeRow).taxonomy?.rank).toBe("subspecies");
  });

  it("reads a node without taxonomy", () => {
    expect(parseNode({ ...nodeRow, taxonomy: null }).taxonomy).toBeNull();
  });
});

describe("parseInteraction", () => {
  it("describes the value by its attribute's name and description", () => {
    expect(parseInteraction(interactionRow).attribute).toBe(
      "number of visit by a pollinator: Individuals seen on a flower",
    );
  });

  it("reads a missing type as unspecified", () => {
    expect(parseInteraction({ ...interactionRow, type: null }).type).toBe("unspecified");
  });

  it("reads a value that is not a number as null", () => {
    expect(parseInteraction({ ...interactionRow, value: "NaN" }).value).toBeNull();
  });
});

describe("parseReference", () => {
  it("reads an empty DOI as null", () => {
    expect(parseReference({ id: 168, doi: " " }).doi).toBeNull();
  });
});
