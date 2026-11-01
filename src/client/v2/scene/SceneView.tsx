import { lazy, Suspense } from "react";

const BlankScene = lazy(() => import("./BlankScene"));

/** Shows a 3D scene filling the space below the navigation. */
export function SceneView() {
  return (
    <section aria-label="Scene" className="min-h-80 flex-1 rounded border border-line">
      <Suspense fallback={<p className="p-3">Loading the scene…</p>}>
        <BlankScene />
      </Suspense>
    </section>
  );
}
