import { describe, it, expect } from "vitest";
import { getRules } from "../lib/queries/rules";

describe("rules query", () => {
  it("returns the active ruleset version", async () => {
    const r = await getRules();
    expect(r.activeVersion).toBe("1.0.0");
  });

  it("parses current scoring thresholds from rulesJson", async () => {
    const r = await getRules();
    expect(r.activeRules.length).toBeGreaterThan(0);
    const keys = r.activeRules.map((x) => x.key);
    expect(keys).toContain("maxSpread");
    expect(keys).toContain("minLiquidity");
  });

  it("returns rule-change history with before/after + evidence", async () => {
    const r = await getRules();
    expect(r.changes.length).toBe(1);
    const c = r.changes[0];
    expect(c.before).not.toBeNull();
    expect(c.after).not.toBeNull();
    expect(c.reason.length).toBeGreaterThan(0);
    expect(c.evidenceSummary).not.toBeNull();
    // threshold was tightened: maxSpread 0.1 -> 0.05
    expect(c.before!["maxSpread"]).toBe(0.1);
    expect(c.after!["maxSpread"]).toBe(0.05);
  });
});