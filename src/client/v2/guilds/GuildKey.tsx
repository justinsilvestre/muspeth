import type { Appearance } from "../scene/appearance";
import type { BodySet, Sharing } from "./BodySet";
import type { Relation } from "./relations";

type GuildKeyProps = { set: BodySet; relation: Relation; sharing: Sharing; appearance: Appearance };

/** Explains what the cell shows under the chosen relation, how it borrows from Historical Glottometry, and where its data comes from. */
export function GuildKey({ set, relation, sharing, appearance }: GuildKeyProps) {
  const { color } = appearance;
  const bodies = set.bodyNoun.many;
  const citations = [
    ...(relation.citesSet && set.citation ? [set.citation] : []),
    ...relation.citations,
  ];
  return (
    <details open className="rounded border border-line text-sm">
      <summary className="cursor-pointer px-3 py-1.5 text-muted">What you are looking at</summary>
      <div className="grid gap-x-6 gap-y-2 px-3 pb-3 sm:grid-cols-2">
        <ul className="space-y-1">
          <li>
            <Swatch color={color.nucleus} /> Each bright dot is one of the <b>{bodies}</b> of{" "}
            {set.name}, placed so that {bodies} sharing many {relation.partner.many} lie close
            together. A dim dot has no {relation.partner.one} recorded. {set.description}
          </li>
          <li>
            <Swatch color={color.smallSubgroup} /> Each membrane is a <b>guild</b>: a set of{" "}
            {bodies} that share at least one {relation.partner.one}. {relation.explanation}
          </li>
          <li>
            <Swatch color={color.largeSubgroup} /> Membranes shade from the color of the smallest
            guilds to that of the largest. <Swatch color={color.family} /> The outer membrane is the
            whole set.
          </li>
          <li>
            A membrane's wall is brighter and thicker the higher its <b>subgroupiness</b>: the
            number of {relation.partner.many} shared by exactly its {bodies}, scaled down by how
            many {relation.partner.many} cut across it. The threshold slider hides guilds below a
            given subgroupiness.
          </li>
        </ul>
        <div className="space-y-2 text-muted">
          <p>
            The <b>Bodies</b> menu chooses the set of dots and <b>Membranes by</b> the relation that
            draws the membranes around them.
            {relation.weight &&
              " The slider admits only encounters counted at least that many times, and Replay starts from the single most frequent encounter and admits rarer ones step by step, so that the guilds grow and merge as the season fills in."}
          </p>
          <p>
            Point at a membrane to see its guild and the {relation.partner.many} that hold it
            together.
          </p>
          <p className="text-xs">
            Data:{" "}
            {citations.map((citation) => (
              <span key={citation.url}>
                <a href={citation.url} className="underline hover:text-ink">
                  {citation.text}
                </a>{" "}
              </span>
            ))}
            Taken through the first version's database
            {sharing.licences.length > 0 && ` (${sharing.licences.join(", ")})`}. Scores follow
            Kalyan & François (2018).
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
