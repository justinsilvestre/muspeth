import type { ReactNode } from "react";

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
};

/** Links to another site in a new tab. */
export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <a href={href} className="underline" target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
