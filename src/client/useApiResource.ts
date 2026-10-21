import { useEffect, useState } from "react";

/** Data loaded earlier, with the path it was loaded from. */
type LoadedData<Data> = { path: string; data: Data };

type ApiResource<Data> =
  | { status: "loading"; previous?: LoadedData<Data> }
  | ({ status: "loaded" } & LoadedData<Data>)
  | { status: "failed"; error: Error };

/**
 * Fetches JSON from the given API path, refetching whenever the path changes.
 * While a new path loads, the data last loaded stays available as `previous`.
 */
export function useApiResource<Data>(path: string) {
  const [resource, setResource] = useState<ApiResource<Data>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setResource((current) => ({ status: "loading", previous: findLoadedData(current) }));
    fetchJson<Data>(path, controller.signal)
      .then((data) => setResource({ status: "loaded", path, data }))
      .catch((error: Error) => {
        if (!controller.signal.aborted) setResource({ status: "failed", error });
      });
    return () => controller.abort();
  }, [path]);

  return resource;
}

function findLoadedData<Data>(resource: ApiResource<Data>) {
  if (resource.status === "loaded") return { path: resource.path, data: resource.data };
  return resource.status === "loading" ? resource.previous : undefined;
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
