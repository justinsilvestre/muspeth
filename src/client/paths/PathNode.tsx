type PathNodeProps = {
  name: string;
  /** Words read out before the name, such as "to", that are implied visually by the node's place on the path. */
  lead: string;
};

/** Shows a node as a stop on a path drawn from top to bottom. */
export function PathNode({ name, lead }: PathNodeProps) {
  return (
    <p className="flex items-center gap-2 font-medium">
      <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full border-2 border-ink" />
      <span className="wrap-anywhere min-w-0">
        <span className="sr-only">{lead} </span>
        {name}
      </span>
    </p>
  );
}
