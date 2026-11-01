import type { LanguageFamily } from "../glottometry/families";
import type { Appearance } from "./appearance";

type DiagramKeyProps = { family: LanguageFamily; appearance: Appearance };

/** Explains what the cell shows, and cites where its data comes from. */
export function DiagramKey({ family, appearance }: DiagramKeyProps) {
  const { color } = appearance;
  const placement = family.coordinates
    ? "placed where it is spoken: the arrows show north and east, each spanning half a degree"
    : "placed so that languages sharing many innovations lie close together";
  return (
    <details open className="rounded border border-line text-sm">
      <summary className="cursor-pointer px-3 py-1.5 text-muted">What you are looking at</summary>
      <div className="grid gap-x-6 gap-y-2 px-3 pb-3 sm:grid-cols-2">
        <ul className="space-y-1">
          <li>
            <Swatch color={color.nucleus} /> Each bright dot is a <b>language</b> of the{" "}
            {family.name}, {placement}. {family.description}
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
        <div className="space-y-2 text-muted">
          <p>
            Point at a membrane to see its subgroup and scores, or at a dot to see its language.
          </p>
          <p className="text-xs">
            Data:{" "}
            <a href={family.citation.url} className="underline hover:text-ink">
              {family.citation.text}
            </a>{" "}
            Scores follow Kalyan & François (2018),{" "}
            <a
              href="https://alex.francois.online.fr/data/Kalyan-Francois_2018_Freeing-Comparative-Method-from-Tree-model.pdf"
              className="underline hover:text-ink"
            >
              Freeing the Comparative Method from the tree model
            </a>
            .
          </p>
        </div>
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
