import { describe, expect, it } from "vitest";
import { isDailyLimitError, secondsUntilLimitReset } from "./dailyLimitError";

const readLimitMessage =
  "D1_ERROR: Your account has exceeded D1's free tier daily row read limit. Upgrade to a paid plan or wait until tomorrow (midnight UTC) to continue.";

describe("isDailyLimitError", () => {
  it("recognizes the error for the daily limit on rows read", () => {
    expect(isDailyLimitError(new Error(readLimitMessage))).toBe(true);
  });

  it("recognizes the error for the daily limit on rows written", () => {
    const message = readLimitMessage.replace("row read", "row write");
    expect(isDailyLimitError(new Error(message))).toBe(true);
  });

  it("does not recognize other errors", () => {
    expect(isDailyLimitError(new Error("D1_ERROR: no such table: nodes"))).toBe(false);
  });
});

describe("secondsUntilLimitReset", () => {
  it("counts the seconds until the next midnight UTC", () => {
    expect(secondsUntilLimitReset(new Date("2026-10-21T23:59:00Z"))).toBe(60);
  });

  it("counts a whole day from midnight UTC", () => {
    expect(secondsUntilLimitReset(new Date("2026-10-21T00:00:00Z"))).toBe(86_400);
  });
});
