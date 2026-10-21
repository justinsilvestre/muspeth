import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { NodeMedia } from "../../shared/graph";
import { NodeFigure } from "./NodeFigure";

const media = {
  url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Bell.JPG/960px-Bell.JPG",
  licence: "CC-BY-SA-3.0",
  credit: "Dalgial",
  pageUrl: "https://commons.wikimedia.org/wiki/File:Bell.JPG",
} satisfies NodeMedia;

function renderFigure(overrides: Partial<NodeMedia> = {}) {
  render(
    <NodeFigure media={{ ...media, ...overrides }} kind="organism" name="Campanula punctata" />,
  );
}

function renderRecording() {
  const sound = { ...media, url: "https://static.inaturalist.org/sounds/1.wav" };
  return render(<NodeFigure media={sound} kind="recording" name="Apis mellifera, Canada" />);
}

afterEach(cleanup);

describe("NodeFigure", () => {
  it("describes the image by the node's name", () => {
    renderFigure();
    expect(screen.getByRole("img").getAttribute("alt")).toBe("Campanula punctata");
  });

  it("loads a thumbnail sized for the figure", () => {
    renderFigure();
    expect(screen.getByRole("img").getAttribute("src")).toContain("/330px-Bell.JPG");
  });

  it("links the author's credit to the image's page", () => {
    renderFigure();
    expect(screen.getByRole("link", { name: "Dalgial" }).getAttribute("href")).toBe(media.pageUrl);
  });

  it("links the licence to its deed", () => {
    renderFigure();
    expect(screen.getByRole("link", { name: "CC BY-SA 3.0" }).getAttribute("href")).toBe(
      "https://creativecommons.org/licenses/by-sa/3.0/",
    );
  });

  it("says when the author is unknown", () => {
    renderFigure({ credit: null });
    expect(screen.getByRole("link", { name: "Unknown author" })).toBeDefined();
  });

  describe("for a recording", () => {
    it("plays the sound", () => {
      const { container } = renderRecording();
      expect(container.querySelector("audio")?.getAttribute("src")).toBe(
        "https://static.inaturalist.org/sounds/1.wav",
      );
    });

    it("names the player by the node's name", () => {
      const { container } = renderRecording();
      expect(container.querySelector("audio")?.getAttribute("aria-label")).toBe(
        "Apis mellifera, Canada",
      );
    });

    it("shows no image", () => {
      renderRecording();
      expect(screen.queryByRole("img")).toBeNull();
    });
  });
});
