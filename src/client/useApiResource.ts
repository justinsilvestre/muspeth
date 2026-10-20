import { useEffect, useState } from "react";

type ApiResource<Data> =
  | { status: "loading" }
  | { status: "loaded"; data: Data }
  | { status: "failed"; error: Error };

/** Fetches JSON from the given API path, refetching whenever the path changes. */
export function useApiResource<Data>(path: string) {
  const [resource, setResource] = useState<ApiResource<Data>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setResource({ status: "loading" });
    fetchJson<Data>(path, controller.signal)
      .then((data) => setResource({ status: "loaded", data }))
      .catch((error: Error) => {
        if (!controller.signal.aborted) setResource({ status: "failed", error });
      });
    return () => controller.abort();
  }, [path]);

  return resource;
}

async function fetchJson<Data>(path: string, signal: AbortSignal) {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error(await describeFailure(response));
  return (await response.json()) as Data;
}

/** Describes a failed response by the error the API gave, or else by its status. */
async function describeFailure(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === "string" ? body.error : `${response.status} ${response.statusText}`;
}
