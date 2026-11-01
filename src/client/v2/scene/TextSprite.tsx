import { useMemo } from "react";
import { CanvasTexture } from "three";

const textureHeight = 64;
/** The blank space either side of the text in the sprite, in texture pixels. */
const sidePadding = 4;
const font = `600 ${textureHeight * 0.7}px system-ui, sans-serif`;
/** The second line is drawn smaller and fainter than the first. */
const secondLineScale = 0.75;
const secondLineAlpha = 0.7;
/** How tall a two-line sprite is, as a multiple of a one-line sprite. */
export const twoLineHeight = 1.7;

type TextSpriteProps = {
  text: string;
  /** A smaller, fainter second line drawn beneath the text in the same sprite, so that the two never part. */
  secondText?: string;
  color: string;
  /** The height of the first line of text in scene units; its width follows from the text. */
  height: number;
  /**
   * Which way the text extends from its position: with dx positive it starts there and runs rightward,
   * with dx negative it ends there. Centered when left out.
   */
  anchor?: { dx: number };
};

/**
 * Shows a short text, with an optional second line, as a flat sprite facing the camera, drawn over everything else,
 * on a canvas so that no fonts need loading. The first line stays centered on the sprite's position.
 */
export function TextSprite({ text, secondText, color, height, anchor }: TextSpriteProps) {
  const { texture, aspect, lines } = useMemo(
    () => drawTexture(text, secondText, color),
    [text, secondText, color],
  );
  const spriteHeight = height * lines;
  const width = spriteHeight * aspect;
  const centerX = anchor ? (Math.sign(anchor.dx) * width) / 2 : 0;
  // A second line hangs below the first, so the sprite's center sits lower than the first line's.
  const centerY = -(spriteHeight - height) / 2;
  return (
    <sprite scale={[width, spriteHeight, 1]} position={[centerX, centerY, 0]} renderOrder={100}>
      <spriteMaterial map={texture} transparent depthWrite={false} depthTest={false} />
    </sprite>
  );
}

function drawTexture(text: string, secondText: string | undefined, color: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const lines = secondText ? twoLineHeight : 1;
  const width = Math.max(
    measureWidth(context, text, 1),
    measureWidth(context, secondText, secondLineScale),
  );
  canvas.width = width;
  canvas.height = textureHeight * lines;
  if (context) {
    // Resizing the canvas resets the context, so the font is set again.
    // Both lines start at the same left edge, so that a second line reads as belonging to the first.
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.font = font;
    context.fillText(text, sidePadding, textureHeight / 2);
    if (secondText) {
      context.font = fontScaled(secondLineScale);
      context.globalAlpha = secondLineAlpha;
      context.fillText(secondText, sidePadding, textureHeight * (1 + (lines - 1) / 2));
    }
  }
  return { texture: new CanvasTexture(canvas), aspect: width / canvas.height, lines };
}

function fontScaled(scale: number) {
  return `600 ${textureHeight * 0.7 * scale}px system-ui, sans-serif`;
}

function measureWidth(
  context: CanvasRenderingContext2D | null,
  text: string | undefined,
  scale: number,
) {
  if (!text) return 0;
  if (!context) return textureHeight;
  context.font = fontScaled(scale);
  return Math.ceil(context.measureText(text).width) + 2 * sidePadding;
}
