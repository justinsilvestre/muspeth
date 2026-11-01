import { useState } from "react";

/** How many more matches each request to see more adds. */
export const matchPageSize = 100;

/**
 * Tracks how many matches of a search to show, starting from one page.
 * Returns to one page whenever the search changes.
 */
export function useShownMatchCount(search: string) {
  const [paging, setPaging] = useState({ search, count: matchPageSize });
  // Resets during render, so that a new search never renders with the old count.
  if (paging.search !== search) setPaging({ search, count: matchPageSize });
  const showMore = () =>
    setPaging((previous) => ({ search, count: previous.count + matchPageSize }));
  return { count: paging.count, showMore };
}
