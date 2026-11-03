import type { ReactNode } from "react";

/** Lays a translucent background of the page's color behind its content, so that a scene beneath the page shows through faintly. */
export function Backdrop({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-2 flex flex-col gap-3 rounded-lg bg-page/80 px-2 py-1.5">{children}</div>
  );
}
