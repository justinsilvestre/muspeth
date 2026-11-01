import { lazy, Suspense, useDeferredValue, useState } from "react";
import type { Subgroup } from "../glottometry/scoreSubgroups";
import { AppearanceControls } from "./AppearanceControls";
import { type Appearance, defaultAppearance } from "./appearance";
import { DiagramKey } from "./DiagramKey";
import { ThresholdSlider } from "./ThresholdSlider";

const CellScene = lazy(() => import("./CellScene"));

/** The subgroupiness display threshold the Historical Glottometry analyzer starts with. */
const defaultThreshold = 1;

/** Shows the glottometric cell below the navigation, with controls for which subgroups it draws and how they look. */
export function SceneView() {
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [hovered, setHovered] = useState<Subgroup>();
  // The scene follows the controls with a delay when it cannot keep up, so that the controls themselves stay responsive.
  const shownAppearance = useDeferredValue(appearance);
  const shownThreshold = useDeferredValue(threshold);
  return (
    <section aria-label="Historical glottometry" className="flex flex-col gap-3">
      <ThresholdSlider value={threshold} onChange={setThreshold} />
      <AppearanceControls
        value={appearance}
        onChange={setAppearance}
        onReset={() => setAppearance(defaultAppearance)}
      />
      <div className="aspect-[16/10] rounded border border-line">
        <Suspense fallback={<p className="p-3">Loading the scene…</p>}>
          <CellScene
            threshold={shownThreshold}
            appearance={shownAppearance}
            hovered={hovered}
            onHover={setHovered}
          />
        </Suspense>
      </div>
      <DiagramKey appearance={appearance} hovered={hovered} />
    </section>
  );
}
