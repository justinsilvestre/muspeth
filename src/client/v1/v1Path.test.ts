import { describe, expect, it } from "vitest";
import { v1Path } from "./v1Path";

describe("v1Path", () => {
  it("prefixes a view's path", () => {
    expect(v1Path("/paths")).toBe("/v1/paths");
  });

  it("gives the version's own address for the root path", () => {
    expect(v1Path("/")).toBe("/v1");
  });
});
