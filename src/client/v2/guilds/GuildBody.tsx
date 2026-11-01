import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import { Color } from "three";
import { layoutByLikeness } from "../glottometry/layoutByLikeness";
import type { LanguageLayout } from "../glottometry/layoutLanguages";
import type { InnovationTable } from "../glottometry/parseInnovationsCsv";
import { placeLabels } from "../glottometry/placeLabels";
import { scoreSubgroups } from "../glottometry/scoreSubgroups";
import type { Appearance } from "../scene/appearance";
import { LanguageNucleus } from "../scene/LanguageNucleus";
import { Membrane } from "../scene/Membrane";
import { type Hovered, pickHovered } from "../scene/pickHovered";
import { type BodySet, labelOf } from "./BodySet";
import { spreadApart } from "./spreadApart";

const diagramExtent = 6.5;
const labelHeight = 0.3;
/** How close two nuclei may lie, by how long their labels run; closer ones are nudged apart so that both can be seen and labelled. */
const leastNucleusDistance = { species: 0.55, plain: 0.9 };

type GuildBodyProps = {
  set: BodySet;
  /** What the bodies share with every link counted; the nuclei are placed by it, so they keep still as the minimum changes. */
  fullTable: InnovationTable;
  /** What the bodies share among the links counted; the membranes are drawn from it. */
  table: InnovationTable;
  isDark: boolean;
  /** Guilds with a lower subgroupiness than this are not drawn. */
  threshold: number;
  appearance: Appearance;
  hovered: Hovered | undefined;
  onHover: (hovered: Hovered | undefined) => void;
};

/** Draws a set as a cell: every body a nucleus, and every set of bodies that shares a partner a membrane nested around its members. */
export function GuildBody(props: GuildBodyProps) {
  const { set, fullTable, table, isDark, threshold, appearance, hovered, onHover } = props;
  const bodies = table.languages;
  const layout = useMemo(() => {
    const likeness = layoutByLikeness(fullTable, diagramExtent, "jaccard");
    const positions = spreadApart(likeness.positions, leastNucleusDistance[set.labelStyle]);
    return { ...likeness, positions };
  }, [fullTable, set.labelStyle]);
  const setPoints = useMemo(() => positionsOf(bodies, layout), [bodies, layout]);
  const labelOffsets = useMemo(
    () =>
      placeLabels(
        bodies.map((name) => ({
          name,
          text: labelOf(set, name),
          position: layout.positions.get(name) ?? { x: 0, y: 0 },
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
  // Membrane thicknesses are scaled to the strongest guild drawn with every link counted.
  const strongest = useMemo(() => scoreSubgroups(fullTable)[0]?.subgroupiness ?? 1, [fullTable]);
  const guilds = useMemo(
    () =>
      scored
        .filter((guild) => guild.subgroupiness >= threshold)
        .map((guild) => ({ guild, points: positionsOf(guild.members, layout) })),
    [scored, threshold, layout],
  );
  const { paddingBase, paddingPerMember } = appearance.shape;
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) =>
    onHover(pickHovered(event.intersections));
  return (
    <group rotation-z={Math.PI / 4}>
      <group onPointerMove={handlePointerMove} onPointerLeave={() => onHover(undefined)}>
        <Membrane
          points={setPoints}
          padding={paddingBase + paddingPerMember * bodies.length + 0.3}
          color={appearance.color.family}
          thickness={0.6}
          order={bodies.length + 1}
          appearance={appearance}
        />
        {guilds.map(({ guild, points }) => (
          <Membrane
            key={guild.members.join()}
            points={points}
            padding={paddingBase + paddingPerMember * guild.members.length}
            color={membraneColor(guild.members.length / bodies.length, appearance)}
            thickness={Math.min(guild.subgroupiness / strongest, 1)}
            order={guild.members.length}
            appearance={appearance}
            subgroup={guild}
            isHighlighted={hovered?.kind === "subgroup" && hovered.subgroup === guild}
          />
        ))}
        {bodies.map((name) => (
          <LanguageNucleus
            key={name}
            name={name}
            label={labelOf(set, name)}
            position={layout.positions.get(name) ?? { x: 0, y: 0 }}
            labelOffset={labelOffsets.get(name) ?? { dx: labelHeight, dy: -labelHeight }}
            labelHeight={labelHeight}
            labelColor={labelColor(isDark, linked.has(name))}
            appearance={appearance}
            isDimmed={!linked.has(name)}
          />
        ))}
      </group>
    </group>
  );
}

function positionsOf(members: string[], { positions }: LanguageLayout) {
  return members.map((name) => positions.get(name) ?? { x: 0, y: 0 });
}

function labelColor(isDark: boolean, isLinked: boolean) {
  if (isLinked) return isDark ? "#f5f5f4" : "#1c1917";
  return isDark ? "#78716c" : "#a8a29e";
}

/** Blends from the small-guild color to the large-guild color by the share of the set's bodies a guild holds. */
function membraneColor(share: number, { color }: Appearance) {
  return `#${new Color(color.smallSubgroup).lerpHSL(new Color(color.largeSubgroup), share).getHexString()}`;
}
