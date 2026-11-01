import { describe, expect, it } from "vitest";
import { apiPath } from "./apiPath";

describe("apiPath", () => {
  it("appends the query parameters", () => {
    expect(apiPath("/api/paths", new URLSearchParams("from=a&to=b"))).toBe(
      "/api/paths?from=a&to=b",
    );
  });

  it("leaves the path bare without query parameters", () => {
    expect(apiPath("/api/paths", new URLSearchParams())).toBe("/api/paths");
  });
});
