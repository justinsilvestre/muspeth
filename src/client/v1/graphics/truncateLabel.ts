/** Shortens a label to at most `maxLength` characters, ending it with an ellipsis when it is cut. */
export function truncateLabel(label: string, maxLength: number) {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1).trimEnd()}…`;
}
