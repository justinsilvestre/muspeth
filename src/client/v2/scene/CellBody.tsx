import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import { Color } from "three";
import { type LanguageFamily, labelOf } from "../glottometry/families";
import { layoutByLikeness } from "../glottometry/layoutByLikeness";
import { type LanguageLayout, layoutLanguages } from "../glottometry/layoutLanguages";
import { placeLabels } from "../glottometry/placeLabels";
import { scoreSubgroups } from "../glottometry/scoreSubgroups";
import type { Appearance } from "./appearance";
import { GeographicAxes } from "./GeographicAxes";
import { LanguageNucleus } from "./LanguageNucleus";
import { Membrane } from "./Membrane";
import { type Hovered, pickHovered } from "./pickHovered";

const diagramExtent = 6.5;
const labelHeight = 0.4;

type CellBodyProps = {
  family: LanguageFamily;
  isDark: boolean;
  /** Subgroups with a lower subgroupiness than this are not drawn. */
  threshold: number;
  appearance: Appearance;
  hovered: Hovered | undefined;
  onHover: (hovered: Hovered | undefined) => void;
};

/** Draws the Demo family as a cell: every language a nucleus, every subgroup a membrane nested around its members. */
export function CellBody({
  family,
  isDark,
  threshold,
  appearance,
  hovered,
  onHover,
}: CellBodyProps) {
  const { table, coordinates } = family;
  const familySize = table.languages.length;
  const layout = useMemo(
    () =>
      coordinates
        ? layoutLanguages(coordinates, diagramExtent)
        : layoutByLikeness(table, diagramExtent),
    [table, coordinates],
  );
  const familyPoints = useMemo(() => positionsOf(table.languages, layout), [table, layout]);
  const labelOffsets = useMemo(
    () =>
      placeLabels(
        table.languages.map((name) => ({
          name,
          text: labelOf(family, name),
          position: layout.positions.get(name) ?? { x: 0, y: 0 },
        })),
        labelHeight,
      ),
    [family, table, layout],
  );
  const scored = useMemo(() => scoreSubgroups(table), [table]);
  // Membrane thicknesses are scaled to the strongest subgroup of the family.
  const strongest = scored[0]?.subgroupiness ?? 1;
  const subgroups = useMemo(
    () =>
      scored
        .filter((subgroup) => subgroup.subgroupiness >= threshold)
        .map((subgroup) => ({ subgroup, points: positionsOf(subgroup.members, layout) })),
    [scored, threshold, layout],
  );
  const { paddingBase, paddingPerMember } = appearance.shape;
  const familyPadding = paddingBase + paddingPerMember * familySize + 0.3;
  const inkColor = isDark ? "#f5f5f4" : "#1c1917";
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) =>
    onHover(pickHovered(event.intersections));
  return (
    <group rotation-z={Math.PI / 4}>
      {coordinates && (
        <GeographicAxes
          origin={axesOrigin(familyPoints, familyPadding)}
          unitsPerDegree={layout.unitsPerDegree}
          color={isDark ? "#a8a29e" : "#57534e"}
        />
      )}
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
            emphasis={
              hovered?.kind === "subgroup" && hovered.subgroup === subgroup ? "raised" : undefined
            }
          />
        ))}
        {table.languages.map((name) => (
          <LanguageNucleus
            key={name}
            name={name}
            label={labelOf(family, name)}
            position={layout.positions.get(name) ?? { x: 0, y: 0 }}
            labelOffset={labelOffsets.get(name) ?? { dx: labelHeight, dy: -labelHeight }}
            labelHeight={labelHeight}
            labelColor={inkColor}
            appearance={appearance}
          />
        ))}
      </group>
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
