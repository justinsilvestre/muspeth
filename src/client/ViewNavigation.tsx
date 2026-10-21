import clsx from "clsx";
import { Link, useLocation } from "react-router";

const views = [
  {
    label: "Connections",
    path: "/",
    isOpenAt: (pathname: string) => pathname === "/" || pathname.startsWith("/organisms/"),
  },
  {
    label: "Paths",
    path: "/paths",
    isOpenAt: (pathname: string) => pathname === "/paths",
  },
  {
    label: "Places and periods",
    path: "/places",
    isOpenAt: (pathname: string) => pathname === "/places",
  },
  {
    label: "Taxonomic tree",
    path: "/taxonomy",
    isOpenAt: (pathname: string) => pathname === "/taxonomy",
  },
];

/** Links to each view, marking the one whose address is open, including organism pages under Connections. */
export function ViewNavigation() {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Views" className="mb-6 flex flex-wrap gap-1 border-line border-b">
      {views.map(({ label, path, isOpenAt }) => (
        <Link
          key={path}
          to={path}
          aria-current={isOpenAt(pathname) ? "page" : undefined}
          className={clsx(
            "-mb-px border-b-2 px-3 py-2",
            isOpenAt(pathname)
              ? "border-ink font-medium"
              : "border-transparent text-muted hover:text-ink",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
