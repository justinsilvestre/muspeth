import type { Appearance } from "../scene/appearance";
import { aOrAn, type BodySet, type Sharing } from "./BodySet";
import type { Relation } from "./relations";

type GuildKeyProps = { set: BodySet; relation: Relation; sharing: Sharing; appearance: Appearance };

/** Explains what the cell shows under the chosen grouping, in that grouping's own words, and where its data comes from. */
export function GuildKey({ set, relation, sharing, appearance }: GuildKeyProps) {
  const { color } = appearance;
  const dots = set.bodyNoun.many;
  const { shared } = relation;
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
            <Swatch color={color.nucleus} /> The bright dots are the <b>{lowerFirst(set.name)}</b>.
            They are placed so that {dots} sharing many {shared.many} lie close together; a dim dot
            has no {shared.one} recorded. {set.description}
          </li>
          <li>
            <Swatch color={color.smallSubgroup} /> Each <b>membrane</b> wraps the {dots}{" "}
            {relation.membrane}. Membranes nest and overlap because {aOrAn(set.bodyNoun.one)} can
            share different {shared.many} with different neighbours. {relation.explanation}
          </li>
          <li>
            <Swatch color={color.largeSubgroup} /> Membranes shade from the color of the smallest
            groups to that of the largest. <Swatch color={color.family} /> The outer membrane holds
            all of them.
          </li>
          <li>
            A membrane's wall is brighter and thicker the more {shared.many} are shared by exactly
            the {dots} inside it, and the fewer {shared.many} cut across it: its{" "}
            <b>subgroupiness</b>, in the terms of Historical Glottometry. The threshold slider hides
            membranes below a given subgroupiness.
          </li>
        </ul>
        <div className="space-y-2 text-muted">
          <p>
            The sentence above the controls chooses the dots and what groups them.
            {relation.weight &&
              ` The visits slider counts an encounter only once the survey saw it that many times, and Replay starts from the single most frequent encounter and admits rarer ones step by step, so that the membranes grow and merge as the season fills in.`}
          </p>
          <p>
            Point at a membrane to see which {shared.many} hold it together, or at a dot to see its
            name.
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

/** Lowers the first letter of a set's name so that it can follow "the" in a sentence, keeping proper nouns as they are. */
function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 rounded-full border border-line align-middle"
      style={{ background: color }}
    />
  );
}
