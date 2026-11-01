import type { Appearance } from "../scene/appearance";
import { type NetworkChoice, otherSide, type Side } from "./PollinationNetwork";

type GuildKeyProps = { network: NetworkChoice; side: Side; appearance: Appearance };

/** Explains what the cell shows, how it borrows from Historical Glottometry, and where its data comes from. */
export function GuildKey({ network, side, appearance }: GuildKeyProps) {
  const { color } = appearance;
  const bodies = side;
  const partners = otherSide(side);
  return (
    <details open className="rounded border border-line text-sm">
      <summary className="cursor-pointer px-3 py-1.5 text-muted">What you are looking at</summary>
      <div className="grid gap-x-6 gap-y-2 px-3 pb-3 sm:grid-cols-2">
        <ul className="space-y-1">
          <li>
            <Swatch color={color.nucleus} /> Each bright dot is one of the <b>{bodies}</b> of the
            site, placed so that {bodies} sharing many {partners} lie close together.{" "}
            {network.description}
          </li>
          <li>
            <Swatch color={color.smallSubgroup} /> Each membrane is a <b>guild</b>: a set of{" "}
            {bodies} that share at least one of the {partners}. Where a glottometric membrane is
            drawn around languages by an innovation they underwent together, this one is drawn
            around {bodies} by another organism that moves between them. Membranes nest and overlap
            because a generalist visits many flowers.
          </li>
          <li>
            <Swatch color={color.largeSubgroup} /> Membranes shade from the color of the smallest
            guilds to that of the largest. <Swatch color={color.family} /> The outer membrane is the
            whole site.
          </li>
          <li>
            A membrane's wall is brighter and thicker the higher its <b>subgroupiness</b>: the
            number of {partners} seen on exactly its {bodies}, scaled down by how many {partners}{" "}
            cut across it. Here a cut is not evidence against the guild, as a cross-cutting
            innovation is against a subgroup, but an organism that belongs to several guilds at
            once.
          </li>
        </ul>
        <div className="space-y-2 text-muted">
          <p>
            The <b>Encounters seen at least</b> slider admits only visits that the survey counted
            that many times; Replay starts from the single most frequent encounter and admits rarer
            ones step by step, so that the guilds grow and merge as the season fills in.
            <b> Bodies</b> swaps the sides, so that the visitors become the dots and the flowers
            they share become the membranes.
          </p>
          <p>Point at a membrane to see its guild and the partners that hold it together.</p>
          <p className="text-xs">
            Data:{" "}
            <a href={network.citation.url} className="underline hover:text-ink">
              {network.citation.text}
            </a>{" "}
            Taken from{" "}
            <a href={network.datasetUrl} className="underline hover:text-ink">
              Mangal network {network.datasetId.replace("mangal:", "")}
            </a>{" "}
            ({network.licence}) through the first version's database. Scores follow Kalyan &
            François (2018).
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
