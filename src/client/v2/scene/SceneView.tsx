import { lazy, Suspense } from "react";

const CellScene = lazy(() => import("./CellScene"));

/** Shows a 3D scene filling the space below the navigation. */
export function SceneView() {
  return (
    <section aria-label="Scene" className="min-h-80 flex-1 rounded border border-line">
      <Suspense fallback={<p className="p-3">Loading the scene…</p>}>
        <CellScene />
      </Suspense>
    </section>
  );
}
