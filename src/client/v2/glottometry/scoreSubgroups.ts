import type { Innovation, InnovationTable } from "./parseInnovationsCsv";

/**
 * A candidate subgroup, as measured by Historical Glottometry (Kalyan & François 2018).
 * Support is the number of innovations shared by exactly these languages.
 * Cohesiveness is the share of innovations involving any member that do not cut across the subgroup.
 * Subgroupiness is support multiplied by cohesiveness.
 */
export type Subgroup = {
  members: string[];
  support: number;
  /** The labels of the supporting innovations: those shared by exactly the members. */
  supporters: string[];
  cohesiveness: number;
  subgroupiness: number;
};

/**
 * Scores every set of languages that shares at least one innovation, except single languages and the whole family,
 * and lists them from the most to the least subgroup-like.
 */
export function scoreSubgroups({ languages, innovations }: InnovationTable) {
  const candidates = new Map<string, ReadonlySet<string>>();
  for (const { members } of innovations)
    if (members.size > 1 && members.size < languages.length)
      candidates.set([...members].sort().join("\0"), members);
  return [...candidates.values()]
    .map((members) => scoreSubgroup(members, innovations))
    .sort((a, b) => b.subgroupiness - a.subgroupiness);
}

function scoreSubgroup(subgroup: ReadonlySet<string>, innovations: Innovation[]) {
  const supporters: string[] = [];
  let compatible = 0;
  let conflicting = 0;
  for (const { label, members } of innovations) {
    const relation = relate(members, subgroup);
    if (relation === "supporting") supporters.push(label);
    else if (relation === "compatible") compatible++;
    else if (relation === "conflicting") conflicting++;
  }
  const support = supporters.length;
  const cohesiveness = (support + compatible) / (support + compatible + conflicting);
  return {
    members: [...subgroup],
    support,
    supporters,
    cohesiveness,
    subgroupiness: support * cohesiveness,
  } satisfies Subgroup;
}

/**
 * An innovation supports a subgroup when shared by exactly its members, is compatible when shared by a subset
 * or a superset of them, conflicts when it cuts across the subgroup boundary, and is unrelated otherwise.
 */
function relate(innovation: ReadonlySet<string>, subgroup: ReadonlySet<string>) {
  const shared = [...innovation].filter((language) => subgroup.has(language)).length;
  if (shared === 0) return "unrelated";
  const isSubset = shared === innovation.size;
  const isSuperset = shared === subgroup.size;
  if (isSubset && isSuperset) return "supporting";
  return isSubset || isSuperset ? "compatible" : "conflicting";
}
