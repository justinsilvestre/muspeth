import { Link } from "react-router";

export function NotFoundView() {
  return (
    <section>
      <h2 className="mb-2 font-medium text-lg">Page not found</h2>
      <p className="text-muted">
        Nothing lives at this address.{" "}
        <Link to="/" className="text-ink underline">
          Back to the organisms
        </Link>
      </p>
    </section>
  );
}
