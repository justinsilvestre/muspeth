import type { ReactNode } from "react";

/** Groups related control fields under a heading, laying them out as rows of label, control, and value. */
export function ControlGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid grid-cols-[7.5rem_minmax(5rem,1fr)_3.5rem] items-center gap-x-2 gap-y-1">
      <legend className="mb-1 font-medium">{title}</legend>
      {children}
    </fieldset>
  );
}
