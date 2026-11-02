import { describe, expect, it } from "vitest";
import { placeBesidePointer } from "./ScenePointer";

const scene = { width: 400, height: 300 };

describe("placeBesidePointer", () => {
  describe("when the pointer is in the scene's top left quarter", () => {
    it("places the tooltip below and to the right of the pointer", () => {
      expect(placeBesidePointer({ ...scene, x: 10, y: 20 })).toEqual({
        left: 24,
        top: 34,
        maxWidth: 288,
      });
    });
  });

  describe("when the pointer is in the scene's bottom right quarter", () => {
    it("places the tooltip above and to the left of the pointer", () => {
      expect(placeBesidePointer({ ...scene, x: 300, y: 250 })).toEqual({
        right: 104,
        bottom: 64,
        maxWidth: 288,
      });
    });
  });

  describe("when the scene is narrower than the widest tooltip", () => {
    const narrow = { ...scene, width: 300, x: 150, y: 20 };

    it("lets the tooltip grow as wide as the scene allows", () => {
      expect(placeBesidePointer(narrow).maxWidth).toBe(284);
    });

    it("shifts the tooltip sideways to keep it inside the scene", () => {
      expect(placeBesidePointer(narrow)).toMatchObject({ left: 8 });
    });
  });
});
