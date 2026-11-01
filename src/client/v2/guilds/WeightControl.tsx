import { useEffect } from "react";
import { SliderField } from "../scene/controls/SliderField";

/** How long the replay dwells on each step of the minimum, in milliseconds. */
const replayStepMs = 220;

type WeightControlProps = {
  words: { label: string; one: string; many: string };
  /** The distinct weights of the relation, from the smallest to the largest. */
  steps: number[];
  /** The index of the step that is the current minimum. */
  value: number;
  onChange: (index: number) => void;
  isReplaying: boolean;
  onReplayChange: (isReplaying: boolean) => void;
};

/**
 * Sets how heavily an encounter must have been counted before it joins the diagram,
 * and replays the season: starting from the most frequent encounter alone, it admits rarer ones step by step.
 */
export function WeightControl(props: WeightControlProps) {
  const { words, steps, value, onChange, isReplaying, onReplayChange } = props;
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
    <div className="grid grid-cols-[minmax(0,auto)_minmax(6rem,1fr)_4.5rem_auto] items-center gap-x-3 text-sm">
      <SliderField
        label={words.label}
        value={value}
        min={0}
        max={Math.max(steps.length - 1, 0)}
        step={1}
        format={() => `${minimum} ${minimum === 1 ? words.one : words.many}`}
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
