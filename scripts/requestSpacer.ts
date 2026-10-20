/**
 * Makes a function that waits until it is the caller's turn to send a request, so that requests
 * from several concurrent callers start at least `intervalMilliseconds` apart.
 */
export function createRequestSpacer(intervalMilliseconds: number) {
  let nextStart = 0;
  return async function waitForTurn() {
    const start = Math.max(Date.now(), nextStart);
    nextStart = start + intervalMilliseconds;
    await new Promise((resolve) => setTimeout(resolve, start - Date.now()));
  };
}
