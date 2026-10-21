const numberFormat = new Intl.NumberFormat("en");

/** Describes how many nodes match a search, and how many of them are shown. */
export function describeMatchCount(shownCount: number, totalCount: number) {
  if (totalCount === 0) return "No matching nodes.";
  const total = `${numberFormat.format(totalCount)} matching ${totalCount === 1 ? "node" : "nodes"}`;
  return shownCount < totalCount ? `Showing ${shownCount} of ${total}.` : `${total}.`;
}
