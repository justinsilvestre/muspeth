import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import { Color } from "three";
import { demoFamily } from "../glottometry/demoFamily";
import { type LanguageLayout, layoutLanguages } from "../glottometry/layoutLanguages";
import { type Subgroup, scoreSubgroups } from "../glottometry/scoreSubgroups";
import type { Appearance } from "./appearance";
import { GeographicAxes } from "./GeographicAxes";
import { LanguageNucleus } from "./LanguageNucleus";
import { Membrane } from "./Membrane";
import { pickInnermostSubgroup } from "./pickInnermostSubgroup";

const diagramExtent = 6.5;
/** The subgroupiness of the strongest subgroup in the family, to which membrane thicknesses are scaled. */
const strongest = scoreSubgroups(demoFamily)[0]?.subgroupiness ?? 1;
const familySize = demoFamily.languages.length;

type CellBodyProps = {
  isDark: boolean;
  /** Subgroups with a lower subgroupiness than this are not drawn. */
  threshold: number;
  appearance: Appearance;
  hovered: Subgroup | undefined;
  onHover: (subgroup: Subgroup | undefined) => void;
};

/** Draws the Demo family as a cell: every language a nucleus, every subgroup a membrane nested around its members. */
export function CellBody({ isDark, threshold, appearance, hovered, onHover }: CellBodyProps) {
  const layout = useMemo(() => layoutLanguages(demoFamily.coordinates, diagramExtent), []);
  const familyPoints = useMemo(() => positionsOf(demoFamily.languages, layout), [layout]);
  const subgroups = useMemo(
    () =>
      scoreSubgroups(demoFamily)
        .filter((subgroup) => subgroup.subgroupiness >= threshold)
        .map((subgroup) => ({ subgroup, points: positionsOf(subgroup.members, layout) })),
    [threshold, layout],
  );
  const { paddingBase, paddingPerMember } = appearance.shape;
  const familyPadding = paddingBase + paddingPerMember * familySize + 0.3;
  const inkColor = isDark ? "#f5f5f4" : "#1c1917";
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) =>
    onHover(pickInnermostSubgroup(event.intersections));
  return (
    <group rotation-z={Math.PI / 4}>
      <GeographicAxes
        origin={axesOrigin(familyPoints, familyPadding)}
        unitsPerDegree={layout.unitsPerDegree}
        color={isDark ? "#a8a29e" : "#57534e"}
      />
      <group onPointerMove={handlePointerMove} onPointerLeave={() => onHover(undefined)}>
        <Membrane
          points={familyPoints}
          padding={familyPadding}
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
            subgroup={subgroup}
            isHighlighted={subgroup === hovered}
          />
        ))}
      </group>
      {demoFamily.languages.map((name) => (
        <LanguageNucleus
          key={name}
          name={name}
          position={layout.positions.get(name) ?? { x: 0, y: 0 }}
          labelColor={inkColor}
          appearance={appearance}
        />
      ))}
    </group>
  );
}

function positionsOf(members: string[], { positions }: LanguageLayout) {
  return members.map((name) => positions.get(name) ?? { x: 0, y: 0 });
}

/** Puts the axes just outside the family membrane, beyond its southwestern-most language. */
function axesOrigin(points: { x: number; y: number }[], familyPadding: number) {
  const southwestern = points.reduce((best, point) =>
    point.x + point.y < best.x + best.y ? point : best,
  );
  const margin = (familyPadding + 0.6) / Math.SQRT2;
  return { x: southwestern.x - margin, y: southwestern.y - margin };
}

/** Blends from the small-subgroup color to the large-subgroup color by the share of the family a subgroup holds. */
function membraneColor(share: number, { color }: Appearance) {
  return `#${new Color(color.smallSubgroup).lerpHSL(new Color(color.largeSubgroup), share).getHexString()}`;
}
