import { useMemo } from "react";
import { demoFamily } from "../glottometry/demoFamily";
import { layoutLanguages, type PlanePoint } from "../glottometry/layoutLanguages";
import { type Subgroup, scoreSubgroups } from "../glottometry/scoreSubgroups";
import { LanguageNucleus } from "./LanguageNucleus";
import { Membrane } from "./Membrane";

const diagramExtent = 7;
/** The subgroupiness of the strongest subgroup in the family, to which rim thicknesses are scaled. */
const strongest = scoreSubgroups(demoFamily)[0]?.subgroupiness ?? 1;

type CellBodyProps = {
  isDark: boolean;
  /** Subgroups with a lower subgroupiness than this are not drawn. */
  threshold: number;
};

/** Draws the Demo family as a cell: every language a nucleus, every subgroup a membrane nested around its members. */
export function CellBody({ isDark, threshold }: CellBodyProps) {
  const layout = useMemo(() => layoutLanguages(demoFamily.coordinates, diagramExtent), []);
  const familyPoints = useMemo(() => positionsOf(demoFamily.languages, layout), [layout]);
  const subgroups = useMemo(
    () =>
      scoreSubgroups(demoFamily)
        .filter((subgroup) => subgroup.subgroupiness >= threshold)
        .map((subgroup) => ({ subgroup, points: positionsOf(subgroup.members, layout) })),
    [threshold, layout],
  );
  return (
    <group rotation-z={Math.PI / 4}>
      <Membrane
        points={familyPoints}
        padding={1.6}
        rimThickness={0.07}
        color={isDark ? "#7fb8a4" : "#3d8c74"}
        bodyOpacity={isDark ? 0.1 : 0.08}
        order={demoFamily.languages.length + 1}
      />
      {subgroups.map(({ subgroup, points }) => (
        <Membrane
          key={subgroup.members.join()}
          points={points}
          padding={padding(subgroup)}
          rimThickness={0.015 + 0.06 * (subgroup.subgroupiness / strongest)}
          color={membraneColor(subgroup, isDark)}
          bodyOpacity={0.04 + 0.12 * subgroup.cohesiveness}
          order={subgroup.members.length}
        />
      ))}
      {demoFamily.languages.map((name) => (
        <LanguageNucleus
          key={name}
          name={name}
          position={layout.get(name) ?? { x: 0, y: 0 }}
          labelColor={isDark ? "#f5f5f4" : "#1c1917"}
        />
      ))}
    </group>
  );
}

function positionsOf(members: string[], layout: Map<string, PlanePoint>) {
  return members.map((name) => layout.get(name) ?? { x: 0, y: 0 });
}

/** Larger subgroups get wider margins, so that a membrane sits visibly outside the membranes it encloses. */
function padding(subgroup: Subgroup) {
  return 0.3 + 0.07 * subgroup.members.length;
}

/** Colors run from warm magenta for small subgroups to cool blue-green for large ones. */
function membraneColor(subgroup: Subgroup, isDark: boolean) {
  const share = subgroup.members.length / demoFamily.languages.length;
  const hue = 330 - 150 * share;
  return `hsl(${hue}, ${isDark ? 60 : 55}%, ${isDark ? 62 : 42}%)`;
}
