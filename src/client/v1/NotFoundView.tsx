import { Link } from "react-router";
import { v1Path } from "./v1Path";

export function NotFoundView() {
  return (
    <section>
      <h2 className="mb-2 font-medium text-lg">Page not found</h2>
      <p className="text-muted">
        Nothing lives at this address.{" "}
        <Link to={v1Path("/")} className="text-ink underline">
          Back to the organisms
        </Link>
      </p>
    </section>
  );
}
