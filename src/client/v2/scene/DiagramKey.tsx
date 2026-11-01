import type { Subgroup } from "../glottometry/scoreSubgroups";
import type { Appearance } from "./appearance";

type DiagramKeyProps = { appearance: Appearance; hovered: Subgroup | undefined };

/** Explains what the cell shows, and names the subgroup the pointer is on. */
export function DiagramKey({ appearance, hovered }: DiagramKeyProps) {
  const { color } = appearance;
  return (
    <details open className="rounded border border-line text-sm">
      <summary className="cursor-pointer px-3 py-1.5 text-muted">What you are looking at</summary>
      <div className="grid gap-x-6 gap-y-2 px-3 pb-3 sm:grid-cols-2">
        <ul className="space-y-1">
          <li>
            <Swatch color={color.nucleus} /> Each bright dot is a <b>language</b> of the sample
            "Demo" family of the Historical Glottometry engine, placed where it is spoken: the
            arrows show north and east, each spanning half a degree.
          </li>
          <li>
            <Swatch color={color.smallSubgroup} /> Each membrane encloses a <b>subgroup</b>: a set
            of languages that share at least one historical innovation. Membranes nest and overlap
            because a language can belong to several subgroups.
          </li>
          <li>
            <Swatch color={color.largeSubgroup} /> Membranes shade from the color of the smallest
            subgroups to that of the largest. <Swatch color={color.family} /> The outer membrane is
            the whole family.
          </li>
          <li>
            A membrane's wall is brighter and thicker the higher its <b>subgroupiness</b>: the
            number of innovations shared by exactly its members, scaled down by how many innovations
            cut across it. The threshold slider hides subgroups below a given subgroupiness.
          </li>
        </ul>
        <p role="status" className="text-muted">
          {hovered ? describe(hovered) : "Point at a membrane to see its subgroup and scores."}
        </p>
      </div>
    </details>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 rounded-full border border-line align-middle"
      style={{ background: color }}
    />
  );
}

function describe({ members, support, cohesiveness, subgroupiness }: Subgroup) {
  const names = members.map((member) => member.replace("Ⓛ", "")).join(" ");
  const plural = support === 1 ? "innovation" : "innovations";
  return `Subgroup ${names}: ${support} supporting ${plural}, cohesiveness ${cohesiveness.toFixed(2)}, subgroupiness ${subgroupiness.toFixed(1)}.`;
}
