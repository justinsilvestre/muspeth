import type { Appearance } from "../appearance";
import { ControlGroup } from "./ControlGroup";
import { SliderField } from "./SliderField";
import { ToggleField } from "./ToggleField";

type Movement = Appearance["movement"];

/** Controls for how the cell moves. */
export function MovementControls({
  value,
  onChange,
}: {
  value: Movement;
  onChange: (value: Movement) => void;
}) {
  const set =
    <Key extends keyof Movement>(key: Key) =>
    (next: Movement[Key]) =>
      onChange({ ...value, [key]: next });
  return (
    <ControlGroup title="Movement">
      <SliderField
        label="Amplitude"
        value={value.amplitude}
        min={0}
        max={0.4}
        step={0.01}
        onChange={set("amplitude")}
      />
      <SliderField
        label="Speed"
        value={value.speed}
        min={0}
        max={3}
        step={0.1}
        format={(speed) => `${speed.toFixed(1)}×`}
        onChange={set("speed")}
      />
      <ToggleField label="Auto-rotate" value={value.autoRotate} onChange={set("autoRotate")} />
    </ControlGroup>
  );
}
