import type { ColorSchemePreference } from "./colorSchemePreference";

const iconPaths = {
  system: "M3 4h14v9H3zM7 16h6M10 13v3",
  light:
    "M10 6.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4",
  dark: "M16 12.5A6.5 6.5 0 0 1 7.5 4a6.5 6.5 0 1 0 8.5 8.5z",
} satisfies Record<ColorSchemePreference, string>;

/** Draws a monitor, sun, or moon to stand for a color scheme preference. */
export function ColorSchemeIcon({ preference }: { preference: ColorSchemePreference }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="size-4 fill-none stroke-[1.5] stroke-current"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[preference]} />
    </svg>
  );
}
