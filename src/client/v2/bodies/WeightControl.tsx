import { useEffect } from "react";
import { SliderField } from "../scene/controls/SliderField";
import type { WeightWords } from "./relations";

/** How long the replay dwells on each step of the minimum, in milliseconds. */
const replayStepMs = 220;

type WeightControlProps = {
  words: WeightWords;
  /** The distinct weights of the relation, from the smallest to the largest. */
  steps: number[];
  /** A name for a step's weight, where the weight stands for something other than a count, by the weight as text. */
  names?: Record<string, string>;
  /** The index of the step that is the current minimum. */
  value: number;
  onChange: (index: number) => void;
  isReplaying: boolean;
  onReplayChange: (isReplaying: boolean) => void;
};

/**
 * Sets the cutoff weight at which a link joins the diagram, and replays the steps: from the heaviest links alone
 * toward the lightest, or, for a weight that stands for time, from the lightest upward.
 */
export function WeightControl(props: WeightControlProps) {
  const { words, steps, names, value, onChange, isReplaying, onReplayChange } = props;
  const last = Math.max(steps.length - 1, 0);
  const upward = words.cutoff === "atMost";
  const [replayStart, replayEnd, replayStep] = upward ? [0, last, 1] : [last, 0, -1];
  useEffect(() => {
    if (!isReplaying) return;
    const timer = setInterval(() => {
      if (value === replayEnd) onReplayChange(false);
      else onChange(value + replayStep);
    }, replayStepMs);
    return () => clearInterval(timer);
  }, [isReplaying, value, replayEnd, replayStep, onChange, onReplayChange]);
  const cutoff = steps[value] ?? 1;
  const shown = names?.[String(cutoff)] ?? `${cutoff} ${cutoff === 1 ? words.one : words.many}`;
  return (
    <div className="grid grid-cols-[minmax(0,auto)_minmax(6rem,1fr)_auto_auto] items-center gap-x-3 text-sm">
      <SliderField
        label={words.label}
        value={value}
        min={0}
        max={last}
        step={1}
        format={() => shown}
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
            onChange(replayStart);
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
