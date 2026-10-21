/**
 * The paths of static files holding the responses of API requests that depend only on the deployed data,
 * by the API path each answers.
 * Each build writes these files from the database, so the client reads them without reaching the Worker.
 */
export const precomputedResponsePaths = {
  "/api/nodes": "/precomputed/nodes.json",
  "/api/taxonomy": "/precomputed/taxonomy.json",
  "/api/sources": "/precomputed/sources.json",
} as const;
