import { databaseAssetPath } from "./databaseAssetPath";
import { openSqlDatabase } from "./openSqlDatabase";

type FileServer = { fetch(url: URL): Promise<Response> };

/** Opens the database file deployed among the static assets. */
export async function loadDatabase(files: FileServer) {
  const response = await files.fetch(new URL(databaseAssetPath, "https://assets.invalid"));
  if (!response.ok) throw new Error(`Could not load the database (HTTP ${response.status})`);
  return openSqlDatabase(new Uint8Array(await response.arrayBuffer()));
}

/** Serves files from the origin of a request to the Vite dev server. */
export function devServerFiles(request: Request) {
  return { fetch: (url: URL) => fetch(new URL(url.pathname, request.url)) } satisfies FileServer;
}
