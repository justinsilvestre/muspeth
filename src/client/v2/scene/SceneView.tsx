import { lazy, Suspense, useDeferredValue, useState } from "react";
import { defaultFamily, type LanguageFamily } from "../glottometry/families";
import { AppearanceControls } from "./AppearanceControls";
import { type Appearance, defaultAppearance } from "./appearance";
import { DiagramKey } from "./DiagramKey";
import { FamilySelect } from "./FamilySelect";
import { HoverTooltip } from "./HoverTooltip";
import type { Hovered } from "./pickHovered";
import { restingPointer, type ScenePointer, toScenePointer } from "./ScenePointer";
import { suppressSelectionUntilRelease } from "./suppressSelectionUntilRelease";
import { ThresholdSlider } from "./ThresholdSlider";

const CellScene = lazy(() => import("./CellScene"));

/** The subgroupiness display threshold the Historical Glottometry analyzer starts with. */
const defaultThreshold = 1;

/** Shows the glottometric cell below the navigation, with controls for which subgroups it draws and how they look. */
export function SceneView() {
  const [family, setFamily] = useState<LanguageFamily>(defaultFamily);
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [hovered, setHovered] = useState<Hovered>();
  const [pointer, setPointer] = useState<ScenePointer>(restingPointer);
  // The scene follows the controls with a delay when it cannot keep up, so that the controls themselves stay responsive.
  const shownAppearance = useDeferredValue(appearance);
  const shownThreshold = useDeferredValue(threshold);
  const tooltip = (
    <HoverTooltip
      hovered={hovered}
      pointer={pointer}
      family={family}
      onClose={() => setHovered(undefined)}
    />
  );
  return (
    <section aria-label="Historical glottometry" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <FamilySelect
          value={family}
          onChange={(next) => {
            setFamily(next);
            setHovered(undefined);
          }}
        />
        <div className="min-w-64 flex-1">
          <ThresholdSlider value={threshold} onChange={setThreshold} />
        </div>
      </div>
      <AppearanceControls
        value={appearance}
        onChange={setAppearance}
        onReset={() => setAppearance(defaultAppearance)}
      />
      <div
        className="relative aspect-square select-none rounded border border-line [-webkit-touch-callout:none] sm:aspect-[16/10]"
        onPointerDown={(event) => {
          suppressSelectionUntilRelease();
          setPointer(toScenePointer(event));
        }}
        onPointerMove={(event) => setPointer(toScenePointer(event))}
      >
        {!pointer.isTouch && tooltip}
        <Suspense fallback={<p className="p-3">Loading the scene…</p>}>
          <CellScene
            family={family}
            threshold={shownThreshold}
            appearance={shownAppearance}
            hovered={hovered}
            onHover={setHovered}
          />
        </Suspense>
      </div>
      {pointer.isTouch && tooltip}
      <DiagramKey family={family} appearance={appearance} />
    </section>
  );
}
