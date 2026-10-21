import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Connection } from "../shared/graph";
import { ConnectionSources } from "./ConnectionSources";

afterEach(cleanup);

const flaggedConnection = {
  id: 1,
  direction: "outgoing",
  neighborId: "b",
  kind: "interaction",
  relation: "eats",
  basis: "observed",
  taxonomicLevel: null,
  weight: null,
  place: null,
  latitude: null,
  longitude: null,
  date: null,
  source: "mangal",
  licence: "CC-BY-4.0",
  qualityFlags: ["duplicate_network_copy"],
  sources: [],
} satisfies Connection;

describe("ConnectionSources", () => {
  it("names the source in full", () => {
    render(<ConnectionSources connection={flaggedConnection} />);
    expect(screen.getByText("From Mangal")).toBeDefined();
  });

  it("states what each quality flag means", () => {
    render(<ConnectionSources connection={flaggedConnection} />);
    expect(screen.getByText(/comes from a copy of a network also held elsewhere/)).toBeDefined();
  });

  it("labels each quality flag in words", () => {
    render(<ConnectionSources connection={flaggedConnection} />);
    expect(screen.getByText("duplicate network copy:")).toBeDefined();
  });
});
