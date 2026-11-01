import { useMemo } from "react";
import { demoFamily } from "../glottometry/demoFamily";
import { layoutLanguages } from "../glottometry/layoutLanguages";
import { membraneContour } from "../glottometry/membraneContour";
import { type Subgroup, scoreSubgroups } from "../glottometry/scoreSubgroups";
import { LanguageNucleus } from "./LanguageNucleus";
import { Membrane } from "./Membrane";

/** Subgroups below this subgroupiness are too weak to be drawn. */
const leastSubgroupiness = 1;
const diagramExtent = 7;
const contourSamples = 96;

/** Draws the Demo family as a cell: every language a nucleus, every subgroup a membrane nested around its members. */
export function CellBody({ isDark }: { isDark: boolean }) {
  const layout = useMemo(() => layoutLanguages(demoFamily.coordinates, diagramExtent), []);
  const subgroups = useMemo(
    () =>
      scoreSubgroups(demoFamily).filter((subgroup) => subgroup.subgroupiness >= leastSubgroupiness),
    [],
  );
  const positionsOf = (members: string[]) =>
    members.map((name) => layout.get(name) ?? { x: 0, y: 0 });
  const strongest = subgroups[0]?.subgroupiness ?? 1;
  return (
    <group rotation-z={Math.PI / 4}>
      <Membrane
        contour={membraneContour(positionsOf(demoFamily.languages), 1.6, contourSamples)}
        thickness={0.07}
        color={isDark ? "#7fb8a4" : "#3d8c74"}
        fillOpacity={isDark ? 0.18 : 0.12}
        z={-1.2}
      />
      {subgroups.map((subgroup) => (
        <Membrane
          key={subgroup.members.join()}
          contour={membraneContour(
            positionsOf(subgroup.members),
            padding(subgroup),
            contourSamples,
          )}
          thickness={0.015 + 0.06 * (subgroup.subgroupiness / strongest)}
          color={membraneColor(subgroup, isDark)}
          fillOpacity={0.04 + 0.16 * subgroup.cohesiveness}
          z={-0.05 * subgroup.members.length}
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
