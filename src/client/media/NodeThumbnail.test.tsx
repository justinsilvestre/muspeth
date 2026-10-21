import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NodeThumbnail } from "./NodeThumbnail";

const media = {
  url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Bell.JPG/960px-Bell.JPG",
  licence: "CC-BY-SA-3.0",
  credit: "Dalgial",
  pageUrl: null,
};

afterEach(cleanup);

describe("NodeThumbnail", () => {
  describe("with an image", () => {
    it("loads the smallest standard thumbnail", () => {
      const { container } = render(<NodeThumbnail media={media} kind="organism" />);
      expect(container.querySelector("img")?.getAttribute("src")).toContain("/120px-Bell.JPG");
    });

    it("hides the image from assistive technology", () => {
      const { container } = render(<NodeThumbnail media={media} kind="organism" />);
      expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
    });

    it("credits the image in its tooltip", () => {
      const { container } = render(<NodeThumbnail media={media} kind="organism" />);
      expect(container.querySelector("img")?.getAttribute("title")).toBe("Dalgial · CC BY-SA 3.0");
    });
  });

  describe("without an image", () => {
    it("draws a mark hidden from assistive technology", () => {
      const { container } = render(<NodeThumbnail media={undefined} kind="compound" />);
      expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    });
  });
});
