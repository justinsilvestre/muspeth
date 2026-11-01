import { useMemo } from "react";
import { CanvasTexture } from "three";

const textureHeight = 64;
const font = `600 ${textureHeight * 0.7}px system-ui, sans-serif`;

type TextSpriteProps = {
  text: string;
  color: string;
  /** The height of the text in scene units; its width follows from the text. */
  height: number;
  /**
   * Which way the text extends from its position: with dx positive it starts there and runs rightward,
   * with dx negative it ends there. Centered when left out.
   */
  anchor?: { dx: number };
  /** How opaque the text is, from 0 to 1; fully opaque when left out. */
  opacity?: number;
};

/** Shows a short text as a flat sprite facing the camera, drawn over everything else, on a canvas so that no fonts need loading. */
export function TextSprite({ text, color, height, anchor, opacity = 1 }: TextSpriteProps) {
  const { texture, aspect } = useMemo(() => drawTexture(text, color), [text, color]);
  const centerX = anchor ? (Math.sign(anchor.dx) * (height * aspect)) / 2 : 0;
  return (
    <sprite scale={[height * aspect, height, 1]} position-x={centerX} renderOrder={100}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        depthTest={false}
      />
    </sprite>
  );
}

function drawTexture(text: string, color: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const width = measureWidth(context, text);
  canvas.width = width;
  canvas.height = textureHeight;
  if (context) {
    // Resizing the canvas resets the context, so the font is set again.
    context.font = font;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(text, width / 2, textureHeight / 2);
  }
  return { texture: new CanvasTexture(canvas), aspect: width / textureHeight };
}

function measureWidth(context: CanvasRenderingContext2D | null, text: string) {
  if (!context) return textureHeight;
  context.font = font;
  return Math.ceil(context.measureText(text).width) + 8;
}
