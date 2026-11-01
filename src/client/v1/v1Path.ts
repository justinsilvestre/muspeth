/** The address prefix under which the first version of the app is served. */
export const v1BasePath = "/v1";

/** Returns the address of a page of the first version, given its path within that version. */
export function v1Path(path: string) {
  return path === "/" ? v1BasePath : `${v1BasePath}${path}`;
}
