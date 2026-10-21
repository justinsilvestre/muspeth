type NodePickerProps = {
  label: string;
  /** The nodes to choose from, as ID and display name, in the order to list them. */
  options: { id: string; name: string }[];
  selectedNodeId: string;
  onChange: (nodeId: string) => void;
};

export function NodePicker({ label, options, selectedNodeId, onChange }: NodePickerProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        className="w-full min-w-0 rounded border border-line bg-page px-2 py-1.5 text-base"
        value={selectedNodeId}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Choose a node…</option>
        {options.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
