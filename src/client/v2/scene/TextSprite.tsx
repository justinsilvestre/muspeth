import { useMemo } from "react";
import { CanvasTexture } from "three";

const textureHeight = 64;
const font = `600 ${textureHeight * 0.7}px system-ui, sans-serif`;

type TextSpriteProps = {
  text: string;
  color: string;
  /** The height of the text in scene units; its width follows from the text. */
  height: number;
};

/** Shows a short text as a flat sprite facing the camera, drawn over everything else, on a canvas so that no fonts need loading. */
export function TextSprite({ text, color, height }: TextSpriteProps) {
  const { texture, aspect } = useMemo(() => drawTexture(text, color), [text, color]);
  return (
    <sprite scale={[height * aspect, height, 1]} renderOrder={100}>
      <spriteMaterial map={texture} transparent depthWrite={false} depthTest={false} />
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
