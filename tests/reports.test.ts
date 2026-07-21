import { describe, it, expect } from "vitest";
import { getReports } from "../lib/queries/reports";

describe("reports query", () => {
  it("returns the latest daily report", async () => {
    const r = await getReports();
    expect(r.latest).not.toBeNull();
    expect(r.latest!.date).toBe("2026-07-20");
    expect(r.latest!.paperPnl).toBeCloseTo(23.3, 2);
  });

  it("includes best + worst wallets today", async () => {
    const r = await getReports();
    expect(r.latest!.bestWallets.length).toBeGreaterThan(0);
    expect(r.latest!.worstWallets.length).toBeGreaterThan(0);
    const best = r.latest!.bestWallets.find((w) => w.address === "demo_wallet_aaa");
    const worst = r.latest!.worstWallets.find((w) => w.address === "demo_wallet_bbb");
    expect(best).toBeDefined();
    expect(best!.pnl).toBeCloseTo(18.67, 2);
    expect(worst).toBeDefined();
    expect(worst!.pnl).toBeCloseTo(-3.2, 2);
  });

  it("surfaces important rule updates in the report", async () => {
    const r = await getReports();
    expect(r.latest!.ruleUpdates.length).toBe(1);
    expect(r.latest!.ruleUpdates[0].version).toBe("1.0.0");
  });

  it("lists recent rule changes for the 'what Hermes changed' section", async () => {
    const r = await getReports();
    expect(r.activeVersion).toBe("1.0.0");
    expect(r.recentRuleChanges.length).toBe(1);
    expect(r.recentRuleChanges[0].reason.length).toBeGreaterThan(0);
    expect(r.recentRuleChanges[0].evidenceSummary).not.toBeNull();
  });
});