import { describe, it, expect } from "vitest";
import { getPerformance } from "../lib/queries/performance";

describe("performance query", () => {
  it("builds a non-empty PnL curve from snapshots", async () => {
    const p = await getPerformance();
    expect(p.pnlCurve.length).toBeGreaterThan(0);
    // every point has a timestamp + numeric pnl
    for (const pt of p.pnlCurve) {
      expect(typeof pt.t).toBe("number");
      expect(typeof pt.pnl).toBe("number");
    }
  });

  it("computes win rate from outcome_reviews (1 good / 2 judged = 0.5)", async () => {
    const p = await getPerformance();
    expect(p.winRate).not.toBeNull();
    expect(p.winRate!).toBeCloseTo(0.5, 2);
  });

  it("bot-filtered wins never exceed blind-copy wins", async () => {
    const p = await getPerformance();
    expect(p.strategy.botFiltered.wins).toBeLessThanOrEqual(
      p.strategy.blindCopy.wins,
    );
    expect(p.strategy.blindCopy.copies).toBeGreaterThanOrEqual(
      p.strategy.botFiltered.copies,
    );
  });

  it("produces category + wallet performance rows", async () => {
    const p = await getPerformance();
    expect(p.categoryPerf.length).toBeGreaterThan(0);
    expect(p.walletPerf.length).toBeGreaterThan(0);
  });

  it("flags missed winners and avoided losers", async () => {
    const p = await getPerformance();
    expect(p.missedWinners).toBeGreaterThanOrEqual(0);
    expect(p.avoidedLosers).toBeGreaterThanOrEqual(0);
  });
});