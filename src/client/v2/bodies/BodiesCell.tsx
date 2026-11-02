import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import { Color } from "three";
import { layoutByLikeness } from "../glottometry/layoutByLikeness";
import type { InnovationTable } from "../glottometry/parseInnovationsCsv";
import { placeLabels } from "../glottometry/placeLabels";
import { scoreSubgroups } from "../glottometry/scoreSubgroups";
import type { Appearance } from "../scene/appearance";
import { FitCamera } from "../scene/FitCamera";
import { LanguageNucleus } from "../scene/LanguageNucleus";
import { Membrane } from "../scene/Membrane";
import { type Hovered, pickHovered } from "../scene/pickHovered";
import { type BodySet, labelOf, sublabelOf } from "./BodySet";
import { easeInOut, type Positions } from "./glidePositions";
import { spreadApart } from "./spreadApart";
import { useGlidingPositions } from "./useGlidingPositions";

const diagramExtent = 6.5;
const labelHeight = 0.3;
/** How close two nuclei may lie, by how long their labels run; closer ones are nudged apart so that both can be seen and labelled. */
const leastNucleusDistance = { species: 1.3, plain: 1.1 };
/** The angle the diagram is turned by, so that its likeness axes do not line up with the screen. */
const diagramRotation = Math.PI / 4;
/** How far beyond the dots the view reaches, for the outer membrane and the labels. */
const viewMargin = 1.2;

type BodiesCellProps = {
  set: BodySet;
  /** What the bodies share with every link counted; the nuclei are placed by it, so they keep still as the minimum changes. */
  fullTable: InnovationTable;
  /** What the bodies share among the links counted; the membranes are drawn from it. */
  table: InnovationTable;
  isDark: boolean;
  /** Membranes with a lower subgroupiness than this are not drawn. */
  threshold: number;
  appearance: Appearance;
  hovered: Hovered | undefined;
  onHover: (hovered: Hovered | undefined) => void;
  fitRequest: number;
};

/**
 * Draws a set as a cell: every body a nucleus, and every set of bodies that shares a partner a membrane nested around its members.
 * When the layout changes, the nuclei glide to their new places while the new membranes fade in around them.
 */
export function BodiesCell(props: BodiesCellProps) {
  const { set, fullTable, table, isDark, threshold, appearance, hovered, onHover, fitRequest } =
    props;
  const bodies = table.languages;
  const layout = useMemo(() => {
    const likeness = layoutByLikeness(fullTable, diagramExtent, "jaccard");
    return spreadApart(likeness.positions, leastNucleusDistance[set.labelStyle]);
  }, [fullTable, set.labelStyle]);
  const { positions, progress } = useGlidingPositions(layout);
  const fade = easeInOut((progress - 0.2) / 0.8);
  const labelOffsets = useMemo(
    () =>
      placeLabels(
        bodies.map((name) => ({
          name,
          text: labelOf(set, name),
          secondText: sublabelOf(set, name),
          position: layout.get(name) ?? { x: 0, y: 0 },
        })),
        labelHeight,
      ),
    [set, bodies, layout],
  );
  const linked = useMemo(
    () => new Set(table.innovations.flatMap(({ members }) => [...members])),
    [table],
  );
  const scored = useMemo(() => scoreSubgroups(table), [table]);
  // Membrane thicknesses are scaled to the strongest membrane drawn with every link counted.
  const strongest = useMemo(() => scoreSubgroups(fullTable)[0]?.subgroupiness ?? 1, [fullTable]);
  const membranes = useMemo(
    () =>
      scored
        .filter((subgroup) => subgroup.subgroupiness >= threshold)
        .map((subgroup) => ({ subgroup, points: positionsOf(subgroup.members, layout) })),
    [scored, threshold, layout],
  );
  const setPoints = useMemo(() => positionsOf(bodies, layout), [bodies, layout]);
  const hoveredMembrane = hovered?.kind === "subgroup" ? hovered.subgroup : undefined;
  const hoveredMembers = useMemo(() => new Set(hoveredMembrane?.members), [hoveredMembrane]);
  const { paddingBase, paddingPerMember } = appearance.shape;
  const setPadding = paddingBase + paddingPerMember * bodies.length + 0.3;
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) =>
    onHover(pickHovered(event.intersections));
  return (
    <group rotation-z={diagramRotation}>
      <FitCamera
        points={setPoints}
        padding={setPadding + viewMargin}
        rotation={diagramRotation}
        fitRequest={fitRequest}
      />
      <group onPointerMove={handlePointerMove} onPointerLeave={() => onHover(undefined)}>
        <Membrane
          points={setPoints}
          padding={setPadding}
          color={appearance.color.family}
          thickness={0.6}
          order={bodies.length + 1}
          appearance={appearance}
          emphasis={hoveredMembrane && "muted"}
          fade={fade}
        />
        {membranes.map(({ subgroup, points }) => (
          <Membrane
            key={subgroup.members.join()}
            points={points}
            padding={paddingBase + paddingPerMember * subgroup.members.length}
            color={membraneColor(subgroup.members.length / bodies.length, appearance)}
            thickness={Math.min(subgroup.subgroupiness / strongest, 1)}
            order={subgroup.members.length}
            appearance={appearance}
            subgroup={subgroup}
            emphasis={hoveredMembrane && (hoveredMembrane === subgroup ? "raised" : "muted")}
            fade={fade}
          />
        ))}
        {bodies.map((name) => (
          <LanguageNucleus
            key={name}
            name={name}
            label={labelOf(set, name)}
            sublabel={sublabelOf(set, name)}
            position={positions.get(name) ?? { x: 0, y: 0 }}
            labelOffset={labelOffsets.get(name) ?? { dx: labelHeight, dy: -labelHeight }}
            labelHeight={labelHeight}
            labelColor={labelColor(isDark, linked.has(name))}
            appearance={appearance}
            isDimmed={!linked.has(name)}
            emphasis={nucleusEmphasis(name, hovered, hoveredMembers)}
          />
        ))}
      </group>
    </group>
  );
}

function positionsOf(members: string[], positions: Positions) {
  return members.map((name) => positions.get(name) ?? { x: 0, y: 0 });
}

/** A body is raised as the one pointed at or as a member of the membrane pointed at, and muted while another membrane is. */
function nucleusEmphasis(name: string, hovered: Hovered | undefined, members: Set<string>) {
  if (!hovered) return undefined;
  if (hovered.kind === "language") return hovered.name === name ? "raised" : undefined;
  return members.has(name) ? "raised" : "muted";
}

function labelColor(isDark: boolean, isLinked: boolean) {
  if (isLinked) return isDark ? "#f5f5f4" : "#1c1917";
  return isDark ? "#78716c" : "#a8a29e";
}

/** Blends from the small-membrane color to the large-membrane color by the share of the set's bodies a membrane holds. */
function membraneColor(share: number, { color }: Appearance) {
  return `#${new Color(color.smallSubgroup).lerpHSL(new Color(color.largeSubgroup), share).getHexString()}`;
}
