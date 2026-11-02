import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SceneTooltip } from "./SceneTooltip";

afterEach(cleanup);

const touch = { x: 10, y: 20, width: 400, height: 300, isTouch: true };

describe("SceneTooltip", () => {
  describe("after a tap", () => {
    it("shows a panel instead of a floating tooltip", () => {
      render(
        <SceneTooltip pointer={touch} onClose={() => {}}>
          Gothic
        </SceneTooltip>,
      );
      expect(screen.getByRole("complementary", { name: "What you tapped" })).toBeTruthy();
    });

    it("closes from its Close button", () => {
      const onClose = vi.fn();
      render(
        <SceneTooltip pointer={touch} onClose={onClose}>
          Gothic
        </SceneTooltip>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
