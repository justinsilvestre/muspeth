import clsx from "clsx";
import { NavLink } from "react-router";

const views = [
  { label: "Historical glottometry", path: "/v2" },
  { label: "Biological glottometry", path: "/v2/biological-glottometry" },
];

/** Links to each view of the second version, marking the one that is open. */
export function V2Navigation() {
  return (
    <nav aria-label="Views" className="flex gap-1 border-line border-b text-sm sm:text-base">
      {views.map(({ label, path }) => (
        <NavLink
          key={path}
          to={path}
          end
          className={({ isActive }) =>
            clsx(
              "-mb-px whitespace-nowrap border-b-2 px-2 py-1.5 sm:px-3 sm:py-2",
              isActive ? "border-ink font-medium" : "border-transparent text-muted hover:text-ink",
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
