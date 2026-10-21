import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PathList } from "./PathList";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PathList", () => {
  describe("when the search finds no path", () => {
    it("says that a path may still exist through a node with many neighbours", async () => {
      vi.stubGlobal("fetch", async () => Response.json({ paths: [] }));
      render(<PathList params={new URLSearchParams("from=a&to=b")} nameOf={(id) => id} />);
      expect((await screen.findByRole("status")).textContent).toMatch(
        /may still exist through a node with more than 100 neighbours/,
      );
    });
  });
});
