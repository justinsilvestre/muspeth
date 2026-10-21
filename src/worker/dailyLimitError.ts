const secondsPerDay = 86_400;

/** Tells whether D1 refused a query because the account used up its free daily rows read or written. */
export function isDailyLimitError(error: Error) {
  return /free tier daily row (read|write) limit/.test(error.message);
}

/** Counts the seconds until D1's daily limits reset, which happens at midnight UTC. */
export function secondsUntilLimitReset(now: Date) {
  const secondsIntoDay = Math.floor(now.getTime() / 1000) % secondsPerDay;
  return secondsPerDay - secondsIntoDay;
}
