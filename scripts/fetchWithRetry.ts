import { cachedFetch } from "./cachedFetch.ts";

const maxAttempts = 4;
const retryableStatuses = [429, 502, 503, 504];

/**
 * Fetches a URL, waiting and retrying when the server is busy or temporarily unavailable.
 * Returns the last response when every attempt got a retryable status, so the caller can report it.
 */
export async function fetchWithRetry(url: string | URL, init?: RequestInit) {
  for (let attempt = 1; ; attempt++) {
    const response = await cachedFetch(url, init);
    if (attempt === maxAttempts || !retryableStatuses.includes(response.status)) return response;
    await sleep(Number(response.headers.get("retry-after") ?? attempt * 5) * 1000);
  }
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
