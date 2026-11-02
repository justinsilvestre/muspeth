import { describe, expect, it } from "vitest";
import { placeMenuBelow } from "./placeMenuBelow";

const button = { bottom: 40, right: 360 };

describe("placeMenuBelow", () => {
  it("lines the menu's right edge up with the button's", () => {
    expect(placeMenuBelow(button, { x: 0, y: 0 }, 375).right).toBe(15);
  });

  it("places the menu just below the button, wherever the page is scrolled to", () => {
    expect(placeMenuBelow(button, { x: 0, y: 200 }, 375).top).toBe(244);
  });
});
