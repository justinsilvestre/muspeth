import { describe, expect, it } from "vitest";
import { placeBesidePointer } from "./ScenePointer";

const scene = { width: 400, height: 300, isTouch: false };

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
        right: 114,
        bottom: 64,
        maxWidth: 272,
      });
    });
  });

  describe("when the scene is narrower than the widest tooltip", () => {
    it("narrows the tooltip to the room beside the pointer", () => {
      expect(placeBesidePointer({ ...scene, width: 300, x: 250, y: 20 }).maxWidth).toBe(222);
    });
  });
});
