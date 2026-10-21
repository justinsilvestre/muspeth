import { useEffect, useState } from "react";
import { SRGBColorSpace, type Texture, TextureLoader } from "three";
import { cropToSquare } from "./cropToSquare";

const loader = new TextureLoader();

/**
 * Loads an image as a texture cropped to its centered square, or gives null until it loads.
 * An image that fails to load stays null, so the caller can draw something else in its place.
 */
export function useSquareTexture(url: string | undefined) {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!url) return;
    let isCurrent = true;
    let loaded: Texture | null = null;
    loader.load(url, (texture) => {
      loaded = texture;
      if (!isCurrent) return texture.dispose();
      const { repeat, offset } = cropToSquare(texture.image.width, texture.image.height);
      texture.repeat.fromArray(repeat);
      texture.offset.fromArray(offset);
      texture.colorSpace = SRGBColorSpace;
      setTexture(texture);
    });
    return () => {
      isCurrent = false;
      loaded?.dispose();
      setTexture(null);
    };
  }, [url]);

  return texture;
}
