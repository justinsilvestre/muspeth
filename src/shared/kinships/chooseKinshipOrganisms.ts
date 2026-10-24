type KinshipCandidate = {
  id: string;
  /** The organism's taxonomic class, so that no one class fills the set. */
  className: string;
  kindCount: number;
  connectionCount: number;
};

type KinshipChoice = { perClass: number; max: number; minKinds: number };

/**
 * Chooses organisms that connect to the graph in at least `minKinds` kinds of connection:
 * a few of each class, favouring those connected in the most kinds and then by the most connections,
 * up to `max` in all.
 */
export function chooseKinshipOrganisms(candidates: KinshipCandidate[], choice: KinshipChoice) {
  const byClass = Map.groupBy(
    candidates.filter(({ kindCount }) => kindCount >= choice.minKinds),
    ({ className }) => className,
  );
  return [...byClass.values()]
    .flatMap((members) => byBreadth(members).slice(0, choice.perClass))
    .sort(compareBreadth)
    .slice(0, choice.max)
    .map(({ id }) => id);
}

function byBreadth(candidates: KinshipCandidate[]) {
  return [...candidates].sort(compareBreadth);
}

function compareBreadth(a: KinshipCandidate, b: KinshipCandidate) {
  return b.kindCount - a.kindCount || b.connectionCount - a.connectionCount;
}
