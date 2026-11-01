import type { Appearance } from "../appearance";
import { ColorField } from "./ColorField";
import { ControlGroup } from "./ControlGroup";

type Colors = Appearance["color"];

/** Controls for the colors of the membranes and nuclei. */
export function ColorControls({
  value,
  onChange,
}: {
  value: Colors;
  onChange: (value: Colors) => void;
}) {
  const set =
    <Key extends keyof Colors>(key: Key) =>
    (next: Colors[Key]) =>
      onChange({ ...value, [key]: next });
  return (
    <ControlGroup title="Color">
      <ColorField
        label="Small subgroups"
        value={value.smallSubgroup}
        onChange={set("smallSubgroup")}
      />
      <ColorField
        label="Large subgroups"
        value={value.largeSubgroup}
        onChange={set("largeSubgroup")}
      />
      <ColorField label="Family" value={value.family} onChange={set("family")} />
      <ColorField label="Nuclei" value={value.nucleus} onChange={set("nucleus")} />
    </ControlGroup>
  );
}
