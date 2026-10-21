type ConnectionSentenceProps = {
  sourceName: string;
  relation: string;
  targetName: string;
};

/** States a connection as its source, relation and target, for example "pine mutualistOf matsutake". */
export function ConnectionSentence({ sourceName, relation, targetName }: ConnectionSentenceProps) {
  return (
    <p>
      {sourceName} <code className="text-sm">{relation}</code> {targetName}
    </p>
  );
}
