import clsx from "clsx";
import { NavLink } from "react-router";

const views = [{ label: "Historical glottometry", path: "/v2" }];

/** Links to each view of the second version, marking the one that is open. */
export function V2Navigation() {
  return (
    <nav aria-label="Views" className="mb-6 flex flex-wrap gap-1 border-line border-b">
      {views.map(({ label, path }) => (
        <NavLink
          key={path}
          to={path}
          end
          className={({ isActive }) =>
            clsx(
              "-mb-px border-b-2 px-3 py-2",
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
