import { useMemo } from "react";
import { CanvasTexture } from "three";

const textureSize = 128;

/** Shows a short text as a flat sprite facing the camera, drawn on a canvas so that no fonts need loading. */
export function LanguageLabel({
  text,
  color,
  size,
}: {
  text: string;
  color: string;
  size: number;
}) {
  const texture = useMemo(() => drawTexture(text, color), [text, color]);
  return (
    <sprite scale={[size, size, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function drawTexture(text: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = textureSize;
  canvas.height = textureSize;
  const context = canvas.getContext("2d");
  if (context) {
    context.font = `600 ${textureSize * 0.55}px system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(text, textureSize / 2, textureSize / 2);
  }
  return new CanvasTexture(canvas);
}
