const userAgent = "muspeth-import (https://github.com/justinsilvestre/muspeth)";
const maxAttempts = 4;
const retryableStatuses = [403, 429, 500, 502, 503, 504];

/**
 * Fetches JSON with the import's user agent, retrying after a pause when the server is busy.
 * Returns null for a missing page (404).
 */
export async function fetchJsonPolitely(url: string) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: { "user-agent": userAgent } });
    if (response.ok) return (await response.json()) as unknown;
    if (response.status === 404) return null;
    if (attempt === maxAttempts || !retryableStatuses.includes(response.status)) {
      throw new Error(`${response.status} from ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
  }
}
