import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Returns the given IDs, together with any recently dropped from them, which stay for the given time.
 * This keeps an element mounted long enough to finish a fade-out after it is no longer wanted.
 */
export function useLingeringIds(ids: Set<string>, lingerMs: number) {
  const [lingeringIds, setLingeringIds] = useState(new Set<string>());
  const previousIds = useRef(ids);

  useEffect(() => {
    const droppedIds = [...previousIds.current].filter((id) => !ids.has(id));
    previousIds.current = ids;
    if (droppedIds.length === 0) return;
    setLingeringIds((current) => new Set([...current, ...droppedIds]));
    setTimeout(() => {
      setLingeringIds((current) => new Set([...current].filter((id) => !droppedIds.includes(id))));
    }, lingerMs);
  }, [ids, lingerMs]);

  return useMemo(() => new Set([...ids, ...lingeringIds]), [ids, lingeringIds]);
}
