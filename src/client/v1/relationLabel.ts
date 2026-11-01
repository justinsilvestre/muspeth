/** Turns a camel-case relation such as "hasEctomycorrhizalHost" into lower-case words for display. */
export function relationLabel(relation: string) {
  if (relation.includes(" ")) return relation;
  return relation.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
}
