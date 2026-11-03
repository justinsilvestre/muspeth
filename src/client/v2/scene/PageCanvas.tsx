import { Canvas, type CanvasProps, useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import { PerspectiveCamera } from "three";

type PageCanvasProps = Pick<CanvasProps, "camera" | "onPointerMissed" | "children"> & {
  /** The element of the page that the scene is framed by and that takes the pointer for it. */
  frame: RefObject<HTMLElement | null>;
};

/**
 * Renders a scene on a canvas that fills the window behind the page, with the camera's view fitted to the frame element.
 * The scene sits where the frame is and moves with it as the page scrolls, while whatever reaches past the frame
 * still shows around it, beneath the rest of the page. Only the frame turns and zooms the scene,
 * so that the rest of the page scrolls and responds as usual.
 */
export function PageCanvas({ frame, children, ...props }: PageCanvasProps) {
  return (
    <Canvas
      {...props}
      eventSource={frame}
      eventPrefix="client"
      style={{ position: "fixed", inset: 0, zIndex: -1 }}
    >
      <FitViewToFrame frame={frame} />
      {children}
    </Canvas>
  );
}

/** Narrows the camera's view to the frame's place in the window, each frame, before the scene is drawn. */
function FitViewToFrame({ frame }: { frame: RefObject<HTMLElement | null> }) {
  useFrame(({ camera, size }) => {
    const bounds = frame.current?.getBoundingClientRect();
    if (!bounds || !(camera instanceof PerspectiveCamera)) return;
    camera.aspect = bounds.width / bounds.height;
    camera.setViewOffset(
      bounds.width,
      bounds.height,
      -bounds.left,
      -bounds.top,
      size.width,
      size.height,
    );
  });
  return null;
}
