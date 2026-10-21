/**
 * Lists the sources that an import should run: those named by an `--only=a,b` argument,
 * or else the default sources.
 */
export function listChosenSources(args: string[], defaultSources: string[]) {
  const only = args.find((arg) => arg.startsWith("--only="));
  return only ? only.slice("--only=".length).split(",") : defaultSources;
}
