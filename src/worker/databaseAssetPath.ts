/**
 * The path of the database file among the static assets.
 * Requests for it reach the Worker first, which keeps the file from being served to the public.
 */
export const databaseAssetPath = "/_data/muspeth.sqlite";
