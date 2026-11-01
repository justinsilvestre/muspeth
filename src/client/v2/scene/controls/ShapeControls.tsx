import type { Appearance } from "../appearance";
import { ControlGroup } from "./ControlGroup";
import { SliderField } from "./SliderField";

type Shape = Appearance["shape"];

/** Controls for the membranes' proportions. */
export function ShapeControls({
  value,
  onChange,
}: {
  value: Shape;
  onChange: (value: Shape) => void;
}) {
  const set =
    <Key extends keyof Shape>(key: Key) =>
    (next: Shape[Key]) =>
      onChange({ ...value, [key]: next });
  return (
    <ControlGroup title="Shape">
      <SliderField
        label="Depth"
        value={value.depth}
        min={0.2}
        max={1.5}
        step={0.05}
        onChange={set("depth")}
      />
      <SliderField
        label="Margin"
        value={value.paddingBase}
        min={0.1}
        max={0.8}
        step={0.05}
        onChange={set("paddingBase")}
      />
      <SliderField
        label="Margin per member"
        value={value.paddingPerMember}
        min={0}
        max={0.15}
        step={0.01}
        onChange={set("paddingPerMember")}
      />
      <SliderField
        label="Corners"
        value={value.cornerSharpness}
        min={1}
        max={8}
        step={0.5}
        onChange={set("cornerSharpness")}
      />
    </ControlGroup>
  );
}
