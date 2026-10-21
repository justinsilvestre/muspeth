import { cachedFetch } from "./cachedFetch.ts";
import { userAgent } from "./userAgent.ts";

const maxAttempts = 5;
const retryableStatuses = [403, 429, 500, 502, 503, 504];

/**
 * Fetches JSON with the import's user agent, retrying after a growing pause when the server is
 * busy, has paused the client, or cannot be reached. `waitForTurn` is called before each request that goes to the network.
 * Returns null for a missing page (404).
 */
export async function fetchJsonPolitely(url: string, waitForTurn: () => Promise<void>) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetchOrNull(url, waitForTurn);
    if (response?.ok) return (await response.json()) as unknown;
    if (response?.status === 404) return null;
    const isRetryable = !response || retryableStatuses.includes(response.status);
    if (attempt === maxAttempts || !isRetryable) {
      throw new Error(`${response?.status ?? "No response"} from ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 15_000));
  }
}

async function fetchOrNull(url: string, waitForTurn: () => Promise<void>) {
  try {
    return await cachedFetch(url, { headers: { "user-agent": userAgent } }, waitForTurn);
  } catch {
    return null;
  }
}
