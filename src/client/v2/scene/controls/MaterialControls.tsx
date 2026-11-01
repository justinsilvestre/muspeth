import { type Appearance, type Finish, finishes } from "../appearance";
import { ControlGroup } from "./ControlGroup";
import { SelectField } from "./SelectField";
import { SliderField } from "./SliderField";

type Material = Appearance["material"];
const finishNames = Object.keys(finishes) as Finish[];

/** Controls for how the membranes' surfaces look. */
export function MaterialControls({
  value,
  onChange,
}: {
  value: Material;
  onChange: (value: Material) => void;
}) {
  const set =
    <Key extends keyof Material>(key: Key) =>
    (next: Material[Key]) =>
      onChange({ ...value, [key]: next });
  return (
    <ControlGroup title="Material">
      <SliderField
        label="Body opacity"
        value={value.bodyOpacity}
        min={0}
        max={0.5}
        step={0.01}
        onChange={set("bodyOpacity")}
      />
      <SliderField
        label="Edge strength"
        value={value.edgeStrength}
        min={0}
        max={1}
        step={0.05}
        onChange={set("edgeStrength")}
      />
      <SliderField
        label="Edge width"
        value={value.edgeWidth}
        min={0.1}
        max={1.5}
        step={0.05}
        onChange={set("edgeWidth")}
      />
      <SelectField
        label="Finish"
        value={value.finish}
        options={finishNames}
        onChange={set("finish")}
      />
    </ControlGroup>
  );
}
