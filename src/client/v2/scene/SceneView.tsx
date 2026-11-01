import { lazy, Suspense, useState } from "react";
import { ThresholdSlider } from "./ThresholdSlider";

const CellScene = lazy(() => import("./CellScene"));

/** The subgroupiness display threshold the Historical Glottometry analyzer starts with. */
const defaultThreshold = 1;

/** Shows the glottometric cell below the navigation, with a slider setting which subgroups it draws. */
export function SceneView() {
  const [threshold, setThreshold] = useState(defaultThreshold);
  return (
    <section aria-label="Scene" className="flex min-h-80 flex-1 flex-col gap-3">
      <ThresholdSlider value={threshold} onChange={setThreshold} />
      <div className="flex-1 rounded border border-line">
        <Suspense fallback={<p className="p-3">Loading the scene…</p>}>
          <CellScene threshold={threshold} />
        </Suspense>
      </div>
    </section>
  );
}
