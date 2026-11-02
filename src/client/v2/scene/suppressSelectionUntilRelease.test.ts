import { describe, expect, it } from "vitest";
import { suppressSelectionUntilRelease } from "./suppressSelectionUntilRelease";

function startSelection() {
  const event = new Event("selectstart", { cancelable: true });
  document.dispatchEvent(event);
  return event;
}

describe("suppressSelectionUntilRelease", () => {
  describe("while the pointer is held", () => {
    it("prevents a selection from starting", () => {
      suppressSelectionUntilRelease();
      const held = startSelection();
      window.dispatchEvent(new Event("pointerup"));
      expect(held.defaultPrevented).toBe(true);
    });
  });

  describe("after the pointer is released", () => {
    it("lets a selection start again", () => {
      suppressSelectionUntilRelease();
      window.dispatchEvent(new Event("pointerup"));
      expect(startSelection().defaultPrevented).toBe(false);
    });
  });
});
