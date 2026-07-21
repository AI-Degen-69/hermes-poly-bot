import { describe, it, expect } from "vitest";
import { walletScoring } from "../lib/scoring/wallet";

describe("wallet scoring", () => {
  it("penalizes one-hit wonders via global score reduction", () => {
    const steady = walletScoring({
      roi30d: 0.42,
      consistencyScore: 0.88,
      copyabilityScore: 0.91,
      oneHitWonderPenalty: 0,
    });
    const lucky = walletScoring({
      roi30d: 0.39,
      consistencyScore: 0.21,
      copyabilityScore: 0.18,
      oneHitWonderPenalty: 0.9,
    });
    expect(steady.globalScore).toBeGreaterThan(lucky.globalScore);
  });

  it("never produces a score outside [0,1]", () => {
    const s = walletScoring({
      roi30d: 5,
      consistencyScore: 1,
      copyabilityScore: 1,
      oneHitWonderPenalty: 0,
    });
    expect(s.globalScore).toBeGreaterThanOrEqual(0);
    expect(s.globalScore).toBeLessThanOrEqual(1);
  });
});

describe("read-only safety", () => {
  it("flags real-trade execution as forbidden", () => {
    // v1 is paper-only: any sign/execute path must be gated.
    expect(process.env.ALLOW_REAL_TRADES).toBeUndefined();
  });
});
