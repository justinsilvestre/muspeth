import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import { Color } from "three";
import { layoutByLikeness } from "../glottometry/layoutByLikeness";
import type { LanguageLayout } from "../glottometry/layoutLanguages";
import { placeLabels } from "../glottometry/placeLabels";
import { scoreSubgroups } from "../glottometry/scoreSubgroups";
import type { Appearance } from "../scene/appearance";
import { LanguageNucleus } from "../scene/LanguageNucleus";
import { Membrane } from "../scene/Membrane";
import { type Hovered, pickHovered } from "../scene/pickHovered";
import { abbreviateSpecies } from "./abbreviateSpecies";
import type { PollinationNetwork, Side } from "./PollinationNetwork";
import { spreadApart } from "./spreadApart";
import { toSharingTable } from "./toSharingTable";

const diagramExtent = 6.5;
const labelHeight = 0.3;
/** How close two nuclei may lie; closer ones are nudged apart so that both can be seen and labelled. */
const leastNucleusDistance = 0.55;

type GuildBodyProps = {
  network: PollinationNetwork;
  side: Side;
  /** Encounters counted fewer times than this do not form membranes. */
  minimumVisits: number;
  isDark: boolean;
  /** Guilds with a lower subgroupiness than this are not drawn. */
  threshold: number;
  appearance: Appearance;
  hovered: Hovered | undefined;
  onHover: (hovered: Hovered | undefined) => void;
};

/**
 * Draws one side of a pollination network as a cell: every organism of that side a nucleus,
 * and every set of them that shares a partner on the other side a membrane nested around its members.
 * The nuclei keep their places as the minimum number of visits changes, so that only the membranes move.
 */
export function GuildBody(props: GuildBodyProps) {
  const { network, side, minimumVisits, isDark, threshold, appearance, hovered, onHover } = props;
  const fullTable = useMemo(() => toSharingTable(network, side), [network, side]);
  const table = useMemo(
    () => toSharingTable(network, side, minimumVisits),
    [network, side, minimumVisits],
  );
  const bodies = table.languages;
  const layout = useMemo(() => {
    const likeness = layoutByLikeness(fullTable, diagramExtent);
    return { ...likeness, positions: spreadApart(likeness.positions, leastNucleusDistance) };
  }, [fullTable]);
  const sitePoints = useMemo(() => positionsOf(bodies, layout), [bodies, layout]);
  const labelOffsets = useMemo(
    () =>
      placeLabels(
        bodies.map((name) => ({
          name,
          text: abbreviateSpecies(name),
          position: layout.positions.get(name) ?? { x: 0, y: 0 },
        })),
        labelHeight,
      ),
    [bodies, layout],
  );
  const scored = useMemo(() => scoreSubgroups(table), [table]);
  // Membrane thicknesses are scaled to the strongest guild drawn with every encounter counted.
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
          points={sitePoints}
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
            label={abbreviateSpecies(name)}
            position={layout.positions.get(name) ?? { x: 0, y: 0 }}
            labelOffset={labelOffsets.get(name) ?? { dx: labelHeight, dy: -labelHeight }}
            labelHeight={labelHeight}
            labelColor={isDark ? "#f5f5f4" : "#1c1917"}
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

/** Blends from the small-guild color to the large-guild color by the share of the site's bodies a guild holds. */
function membraneColor(share: number, { color }: Appearance) {
  return `#${new Color(color.smallSubgroup).lerpHSL(new Color(color.largeSubgroup), share).getHexString()}`;
}
