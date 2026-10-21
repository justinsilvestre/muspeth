/**
 * Makes a function that waits until it is the caller's turn to send a request, so that requests
 * from several concurrent callers start at least `intervalMilliseconds` apart.
 */
export function createRequestSpacer(intervalMilliseconds: number) {
  let nextStart = 0;
  return async function waitForTurn() {
    const turn = scheduleTurn(Date.now(), nextStart, intervalMilliseconds);
    nextStart = turn.nextStart;
    await new Promise((resolve) => setTimeout(resolve, turn.waitMilliseconds));
  };
}

/**
 * Decides how long a caller arriving at `now` must wait before starting its request,
 * and the earliest time the caller after it may start.
 */
export function scheduleTurn(now: number, nextStart: number, intervalMilliseconds: number) {
  const start = Math.max(now, nextStart);
  return { waitMilliseconds: start - now, nextStart: start + intervalMilliseconds };
}
