import { describe, expect, it } from "vitest";
import { cropToSquare } from "./cropToSquare";

describe("cropToSquare", () => {
  it("keeps the middle of a wide image", () => {
    expect(cropToSquare(200, 100)).toEqual({ repeat: [0.5, 1], offset: [0.25, 0] });
  });

  it("keeps the middle of a tall image", () => {
    expect(cropToSquare(100, 400)).toEqual({ repeat: [1, 0.25], offset: [0, 0.375] });
  });

  it("keeps all of a square image", () => {
    expect(cropToSquare(50, 50)).toEqual({ repeat: [1, 1], offset: [0, 0] });
  });
});
