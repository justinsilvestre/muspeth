import { useMemo } from "react";
import { Color } from "three";
import { demoFamily } from "../glottometry/demoFamily";
import { layoutLanguages, type PlanePoint } from "../glottometry/layoutLanguages";
import { scoreSubgroups } from "../glottometry/scoreSubgroups";
import type { Appearance } from "./appearance";
import { LanguageNucleus } from "./LanguageNucleus";
import { Membrane } from "./Membrane";

const diagramExtent = 7;
/** The subgroupiness of the strongest subgroup in the family, to which membrane thicknesses are scaled. */
const strongest = scoreSubgroups(demoFamily)[0]?.subgroupiness ?? 1;

type CellBodyProps = {
  isDark: boolean;
  /** Subgroups with a lower subgroupiness than this are not drawn. */
  threshold: number;
  appearance: Appearance;
};

/** Draws the Demo family as a cell: every language a nucleus, every subgroup a membrane nested around its members. */
export function CellBody({ isDark, threshold, appearance }: CellBodyProps) {
  const layout = useMemo(() => layoutLanguages(demoFamily.coordinates, diagramExtent), []);
  const familyPoints = useMemo(() => positionsOf(demoFamily.languages, layout), [layout]);
  const subgroups = useMemo(
    () =>
      scoreSubgroups(demoFamily)
        .filter((subgroup) => subgroup.subgroupiness >= threshold)
        .map((subgroup) => ({ subgroup, points: positionsOf(subgroup.members, layout) })),
    [threshold, layout],
  );
  const familySize = demoFamily.languages.length;
  const { paddingBase, paddingPerMember } = appearance.shape;
  return (
    <group rotation-z={Math.PI / 4}>
      <Membrane
        points={familyPoints}
        padding={paddingBase + paddingPerMember * familySize + 0.3}
        color={appearance.color.family}
        thickness={0.6}
        order={familySize + 1}
        appearance={appearance}
      />
      {subgroups.map(({ subgroup, points }) => (
        <Membrane
          key={subgroup.members.join()}
          points={points}
          padding={paddingBase + paddingPerMember * subgroup.members.length}
          color={membraneColor(subgroup.members.length / familySize, appearance)}
          thickness={subgroup.subgroupiness / strongest}
          order={subgroup.members.length}
          appearance={appearance}
        />
      ))}
      {demoFamily.languages.map((name) => (
        <LanguageNucleus
          key={name}
          name={name}
          position={layout.get(name) ?? { x: 0, y: 0 }}
          labelColor={isDark ? "#f5f5f4" : "#1c1917"}
          appearance={appearance}
        />
      ))}
    </group>
  );
}

function positionsOf(members: string[], layout: Map<string, PlanePoint>) {
  return members.map((name) => layout.get(name) ?? { x: 0, y: 0 });
}

/** Blends from the small-subgroup color to the large-subgroup color by the share of the family a subgroup holds. */
function membraneColor(share: number, { color }: Appearance) {
  return `#${new Color(color.smallSubgroup).lerpHSL(new Color(color.largeSubgroup), share).getHexString()}`;
}
