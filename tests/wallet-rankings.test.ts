import { describe, it, expect, beforeAll } from "vitest";
import { db } from "../db";
import { getWalletRankings } from "../lib/queries/wallets";
import { walletProfiles, decisionJournal, paperTrades } from "../db/schema";

describe("wallet rankings query", () => {
  it("does not double-count paper PnL across decisions", async () => {
    const rows = await getWalletRankings();
    const steady = rows.find((r) => r.address === "demo_wallet_aaa");
    expect(steady).toBeDefined();
    // 1 open trade (unrealized 4.64) + 1 resolved (realized 18.67) = 23.31,
    // NOT 46.62 (which would happen if the JOIN cross-multiplied).
    expect(steady!.paperPnl).toBeCloseTo(23.31, 2);
  });

  it("orders by global score descending and assigns ranks", async () => {
    const rows = await getWalletRankings();
    expect(rows[0].globalScore!).toBeGreaterThanOrEqual(rows[1].globalScore!);
    expect(rows[0].rank).toBe(1);
    expect(rows[1].rank).toBe(2);
  });

  it("zero PnL wallet reports 0, not a positive", async () => {
    const rows = await getWalletRankings();
    const ignored = rows.find((r) => r.address === "demo_wallet_bbb");
    expect(ignored!.paperPnl).toBe(0);
  });
});
