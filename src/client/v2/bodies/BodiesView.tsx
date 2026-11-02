import { lazy, Suspense, useCallback, useDeferredValue, useMemo, useState } from "react";
import { AppearanceControls } from "../scene/AppearanceControls";
import { type Appearance, defaultAppearance } from "../scene/appearance";
import type { Hovered } from "../scene/pickHovered";
import { restingPointer, type ScenePointer, toScenePointer } from "../scene/ScenePointer";
import { suppressSelectionUntilRelease } from "../scene/suppressSelectionUntilRelease";
import { ThresholdSlider } from "../scene/ThresholdSlider";
import { BodiesKey } from "./BodiesKey";
import { BodiesTooltip } from "./BodiesTooltip";
import type { BodySet, Sharing } from "./BodySet";
import { BodySetSelect } from "./BodySetSelect";
import { defaultBodySet } from "./bodySets";
import { Caption } from "./Caption";
import { RelationSelect } from "./RelationSelect";
import { relationOf } from "./relations";
import { countMembranes, toSharingTable, weightSteps } from "./toSharingTable";
import { WeightControl } from "./WeightControl";

const BodiesScene = lazy(() => import("./BodiesScene"));

/** Shows a set of bodies as a cell, with a choice of the relation that draws the membranes. */
export function BodiesView() {
  const [set, setSet] = useState<BodySet>(defaultBodySet);
  const [sharing, setSharing] = useState<Sharing>(firstDrawable(defaultBodySet));
  const [weightStep, setWeightStep] = useState(0);
  const [isReplaying, setReplaying] = useState(false);
  const [threshold, setThreshold] = useState(0);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [hovered, setHovered] = useState<Hovered>();
  const [fitRequest, setFitRequest] = useState(0);
  const [pointer, setPointer] = useState<ScenePointer>(restingPointer);
  const relation = relationOf(sharing.relation);
  const steps = useMemo(() => weightSteps(sharing), [sharing]);
  const cutoff = useMemo(
    () => ({ weight: steps[weightStep] ?? 1, mode: relation.weight?.cutoff ?? "atLeast" }),
    [steps, weightStep, relation],
  );
  const fullTable = useMemo(() => toSharingTable(set, sharing), [set, sharing]);
  const table = useMemo(() => toSharingTable(set, sharing, cutoff), [set, sharing, cutoff]);
  const sharedCounts = useMemo(() => countShared(table.innovations), [table]);
  const changeWeightStep = useCallback((step: number) => setWeightStep(step), []);
  const changeReplaying = useCallback((next: boolean) => setReplaying(next), []);
  // The scene follows the controls with a delay when it cannot keep up, so that the controls themselves stay responsive.
  const shownAppearance = useDeferredValue(appearance);
  const shownThreshold = useDeferredValue(threshold);
  const shownTable = useDeferredValue(table);
  const choose = (nextSet: BodySet, nextSharing: Sharing) => {
    setSet(nextSet);
    setSharing(nextSharing);
    setWeightStep(0);
    setReplaying(false);
    setHovered(undefined);
  };
  const tooltip = (
    <BodiesTooltip
      hovered={hovered}
      pointer={pointer}
      set={set}
      relation={relation}
      sharedCounts={sharedCounts}
      onClose={() => setHovered(undefined)}
    />
  );
  return (
    <section aria-label="Biological glottometry" className="flex flex-col gap-3">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-base">
        <BodySetSelect value={set} onChange={(next) => choose(next, sameOrFirst(next, sharing))} />
        <RelationSelect set={set} value={sharing} onChange={(next) => choose(set, next)} />
      </p>
      <ThresholdSlider
        label="Hide membranes weaker than"
        value={threshold}
        onChange={setThreshold}
      />
      {relation.weight && steps.length > 1 && (
        <WeightControl
          words={relation.weight}
          steps={steps}
          names={sharing.weightNames}
          value={weightStep}
          onChange={changeWeightStep}
          isReplaying={isReplaying}
          onReplayChange={changeReplaying}
        />
      )}
      <AppearanceControls
        value={appearance}
        onChange={setAppearance}
        onReset={() => setAppearance(defaultAppearance)}
      />
      <Caption set={set} relation={relation} table={table} />
      <div
        className="relative aspect-square select-none rounded border border-line [-webkit-touch-callout:none] sm:aspect-[16/10]"
        onPointerDown={(event) => {
          suppressSelectionUntilRelease();
          setPointer(toScenePointer(event));
        }}
        onPointerMove={(event) => setPointer(toScenePointer(event))}
      >
        <button
          type="button"
          onClick={() => setFitRequest((count) => count + 1)}
          className="absolute top-2 right-2 z-10 rounded border border-line bg-panel/80 px-2 py-0.5 text-muted text-xs hover:text-ink"
        >
          Fit to view
        </button>
        {!pointer.isTouch && tooltip}
        <Suspense fallback={<p className="p-3">Loading the scene…</p>}>
          <BodiesScene
            set={set}
            fitRequest={fitRequest}
            fullTable={fullTable}
            table={shownTable}
            threshold={shownThreshold}
            appearance={shownAppearance}
            hovered={hovered}
            onHover={setHovered}
          />
        </Suspense>
      </div>
      {pointer.isTouch && tooltip}
      <BodiesKey set={set} relation={relation} sharing={sharing} appearance={appearance} />
    </section>
  );
}

/** The set's sharing under the same relation as the given one, when it draws membranes, and otherwise its first that does. */
function sameOrFirst(set: BodySet, sharing: Sharing) {
  const same = set.sharings.find((candidate) => candidate.relation === sharing.relation);
  return same && countMembranes(set, same) > 0 ? same : firstDrawable(set);
}

function firstDrawable(set: BodySet) {
  const drawable = set.sharings.find((sharing) => countMembranes(set, sharing) > 0);
  return drawable ?? (set.sharings[0] as Sharing);
}

/** Counts, for each dot, the shared things whose sets of dots include it. */
function countShared(partners: { members: ReadonlySet<string> }[]) {
  const counts = new Map<string, number>();
  for (const { members } of partners)
    for (const body of members) counts.set(body, (counts.get(body) ?? 0) + 1);
  return counts;
}
