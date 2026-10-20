const userAgent = "muspeth-import (https://github.com/justinsilvestre/muspeth)";
const maxAttempts = 5;
const retryableStatuses = [403, 429, 500, 502, 503, 504];

/**
 * Fetches JSON with the import's user agent, retrying after a growing pause when the server is
 * busy, has paused the client, or cannot be reached. `waitForTurn` is called before each request.
 * Returns null for a missing page (404).
 */
export async function fetchJsonPolitely(url: string, waitForTurn: () => Promise<void>) {
  for (let attempt = 1; ; attempt++) {
    await waitForTurn();
    const response = await fetchOrNull(url);
    if (response?.ok) return (await response.json()) as unknown;
    if (response?.status === 404) return null;
    const isRetryable = !response || retryableStatuses.includes(response.status);
    if (attempt === maxAttempts || !isRetryable) {
      throw new Error(`${response?.status ?? "No response"} from ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 15_000));
  }
}

async function fetchOrNull(url: string) {
  try {
    return await fetch(url, { headers: { "user-agent": userAgent } });
  } catch {
    return null;
  }
}
