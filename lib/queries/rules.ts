import { db } from "@/db";
import { ruleSets, ruleChanges } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type RuleEntry = { key: string; value: number | string | boolean };

export type RuleChangeRow = {
  id: number;
  oldRuleSetId: number | null;
  newRuleSetId: number;
  changedBy: string;
  reason: string;
  evidenceSummary: string | null;
  before: Record<string, number | string | boolean> | null;
  after: Record<string, number | string | boolean> | null;
  createdAt: number;
};

export type RulesSummary = {
  activeVersion: string;
  activeRules: RuleEntry[];
  changes: RuleChangeRow[];
};

function parseRules(json: string | null): RuleEntry[] {
  if (!json) return [];
  try {
    const obj = JSON.parse(json) as Record<string, number | string | boolean>;
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  } catch {
    return [];
  }
}

function parseObj(json: string | null): Record<string, number | string | boolean> | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as Record<string, number | string | boolean>;
  } catch {
    return null;
  }
}

export async function getRules(): Promise<RulesSummary> {
  const active = await db
    .select()
    .from(ruleSets)
    .where(eqActive())
    .limit(1);

  const activeRow = active[0];
  const activeRules = parseRules(activeRow?.rulesJson ?? null);

  const changesDb = await db
    .select()
    .from(ruleChanges)
    .orderBy(desc(ruleChanges.createdAt));

  const changes: RuleChangeRow[] = changesDb.map((c) => ({
    id: c.id,
    oldRuleSetId: c.oldRuleSetId,
    newRuleSetId: c.newRuleSetId,
    changedBy: c.changedBy,
    reason: c.reason,
    evidenceSummary: c.evidenceSummary,
    before: parseObj(c.beforeJson),
    after: parseObj(c.afterJson),
    createdAt: c.createdAt.getTime(),
  }));

  return {
    activeVersion: activeRow?.version ?? "unknown",
    activeRules,
    changes,
  };
}

function eqActive() {
  return eq(ruleSets.active, true);
}