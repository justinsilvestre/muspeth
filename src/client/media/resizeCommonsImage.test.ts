import { describe, expect, it } from "vitest";
import { resizeCommonsImage } from "./resizeCommonsImage";

const thumbnail =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Pinus_densiflora.jpg/800px-Pinus_densiflora.jpg";

describe("resizeCommonsImage", () => {
  it("asks Commons for a thumbnail of the given width", () => {
    expect(resizeCommonsImage(thumbnail, 120)).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Pinus_densiflora.jpg/120px-Pinus_densiflora.jpg",
    );
  });

  it("resizes a thumbnail served from the thumbnail host", () => {
    const served =
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Bell.JPG/960px-Bell.JPG";
    expect(resizeCommonsImage(served, 120)).toBe(
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Bell.JPG/120px-Bell.JPG",
    );
  });

  it("keeps the prefix of a thumbnail of a page of a document", () => {
    const pageThumbnail =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Plate.tif/lossy-page1-800px-Plate.tif.jpg";
    expect(resizeCommonsImage(pageThumbnail, 120)).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Plate.tif/lossy-page1-120px-Plate.tif.jpg",
    );
  });

  it("leaves an original Commons image as it is", () => {
    const original = "https://upload.wikimedia.org/wikipedia/commons/a/ab/Pine_400px-wide.jpg";
    expect(resizeCommonsImage(original, 120)).toBe(original);
  });

  it("leaves an image from elsewhere as it is", () => {
    const elsewhere = "https://images.metmuseum.org/CRDImages/as/web-large/800px-pines.jpg";
    expect(resizeCommonsImage(elsewhere, 120)).toBe(elsewhere);
  });
});
