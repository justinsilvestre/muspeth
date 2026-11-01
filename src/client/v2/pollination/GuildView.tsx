import { lazy, Suspense, useCallback, useDeferredValue, useMemo, useState } from "react";
import { AppearanceControls } from "../scene/AppearanceControls";
import { type Appearance, defaultAppearance } from "../scene/appearance";
import type { Hovered } from "../scene/pickHovered";
import { ThresholdSlider } from "../scene/ThresholdSlider";
import { GuildKey } from "./GuildKey";
import { GuildTooltip } from "./GuildTooltip";
import { NetworkSelect } from "./NetworkSelect";
import { defaultNetwork } from "./networks";
import type { NetworkChoice, Side } from "./PollinationNetwork";
import { SideSwitch } from "./SideSwitch";
import { toSharingTable, visitCountSteps } from "./toSharingTable";
import { VisitsControl } from "./VisitsControl";

const GuildScene = lazy(() => import("./GuildScene"));

/** Shows one side of a pollination network as a cell of guilds, with controls for which encounters count. */
export function GuildView() {
  const [network, setNetwork] = useState<NetworkChoice>(defaultNetwork);
  const [side, setSide] = useState<Side>("plants");
  const [visitsStep, setVisitsStep] = useState(0);
  const [isReplaying, setReplaying] = useState(false);
  const [threshold, setThreshold] = useState(0);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [hovered, setHovered] = useState<Hovered>();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const steps = useMemo(() => visitCountSteps(network), [network]);
  const minimumVisits = steps[visitsStep] ?? 1;
  const partnerCounts = useMemo(
    () => countPartners(toSharingTable(network, side, minimumVisits).innovations),
    [network, side, minimumVisits],
  );
  const changeVisitsStep = useCallback((step: number) => setVisitsStep(step), []);
  const changeReplaying = useCallback((next: boolean) => setReplaying(next), []);
  // The scene follows the controls with a delay when it cannot keep up, so that the controls themselves stay responsive.
  const shownAppearance = useDeferredValue(appearance);
  const shownThreshold = useDeferredValue(threshold);
  const shownMinimumVisits = useDeferredValue(minimumVisits);
  return (
    <section aria-label="Pollination guilds" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <NetworkSelect
          value={network}
          onChange={(next) => {
            setNetwork(next);
            setVisitsStep(0);
            setReplaying(false);
            setHovered(undefined);
          }}
        />
        <SideSwitch
          value={side}
          onChange={(next) => {
            setSide(next);
            setHovered(undefined);
          }}
        />
        <div className="min-w-64 flex-1">
          <ThresholdSlider value={threshold} onChange={setThreshold} />
        </div>
      </div>
      <VisitsControl
        steps={steps}
        value={visitsStep}
        onChange={changeVisitsStep}
        isReplaying={isReplaying}
        onReplayChange={changeReplaying}
      />
      <AppearanceControls
        value={appearance}
        onChange={setAppearance}
        onReset={() => setAppearance(defaultAppearance)}
      />
      <div
        className="relative aspect-[16/10] rounded border border-line"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          setPointer({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
        }}
      >
        <GuildTooltip
          hovered={hovered}
          pointer={pointer}
          side={side}
          partnerCounts={partnerCounts}
        />
        <Suspense fallback={<p className="p-3">Loading the scene…</p>}>
          <GuildScene
            network={network}
            side={side}
            minimumVisits={shownMinimumVisits}
            threshold={shownThreshold}
            appearance={shownAppearance}
            hovered={hovered}
            onHover={setHovered}
          />
        </Suspense>
      </div>
      <GuildKey network={network} side={side} appearance={appearance} />
    </section>
  );
}

/** Counts, for each body, the partners whose sets of bodies include it. */
function countPartners(partners: { members: ReadonlySet<string> }[]) {
  const counts = new Map<string, number>();
  for (const { members } of partners)
    for (const body of members) counts.set(body, (counts.get(body) ?? 0) + 1);
  return counts;
}
