import { useEffect } from "react";
import { SliderField } from "../scene/controls/SliderField";

/** How long the replay dwells on each step of the minimum, in milliseconds. */
const replayStepMs = 220;

type VisitsControlProps = {
  /** The distinct visit counts of the network, from the smallest to the largest. */
  steps: number[];
  /** The index of the step that is the current minimum. */
  value: number;
  onChange: (index: number) => void;
  isReplaying: boolean;
  onReplayChange: (isReplaying: boolean) => void;
};

/**
 * Sets how many times an encounter must have been counted before it joins the diagram,
 * and replays the season: starting from the most frequent encounter alone, it admits rarer ones step by step.
 */
export function VisitsControl(props: VisitsControlProps) {
  const { steps, value, onChange, isReplaying, onReplayChange } = props;
  useEffect(() => {
    if (!isReplaying) return;
    const timer = setInterval(() => {
      if (value <= 0) onReplayChange(false);
      else onChange(value - 1);
    }, replayStepMs);
    return () => clearInterval(timer);
  }, [isReplaying, value, onChange, onReplayChange]);
  const minimum = steps[value] ?? 1;
  return (
    <div className="grid grid-cols-[auto_1fr_4.5rem_auto] items-center gap-x-3 text-sm">
      <SliderField
        label="Encounters seen at least"
        value={value}
        min={0}
        max={Math.max(steps.length - 1, 0)}
        step={1}
        format={() => `${minimum} ${minimum === 1 ? "time" : "times"}`}
        onChange={(index) => {
          onReplayChange(false);
          onChange(index);
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (isReplaying) onReplayChange(false);
          else {
            onChange(steps.length - 1);
            onReplayChange(true);
          }
        }}
        className="rounded border border-line px-2 py-0.5 text-xs hover:bg-selected"
      >
        {isReplaying ? "Stop" : "Replay"}
      </button>
    </div>
  );
}
