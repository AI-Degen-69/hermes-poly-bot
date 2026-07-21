import { db } from "@/db";
import { dailyReports, ruleChanges, ruleSets } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type WalletPerf = {
  address: string;
  label: string | null;
  pnl: number;
};

export type RuleUpdate = {
  version: string;
  reason: string;
};

export type DailyReportRow = {
  date: string;
  paperPnl: number | null;
  winRate: number | null;
  openPositions: number | null;
  newSignals: number | null;
  copiedSignals: number | null;
  watchedSignals: number | null;
  skippedSignals: number | null;
  bestWallets: WalletPerf[];
  worstWallets: WalletPerf[];
  ruleUpdates: RuleUpdate[];
  summary: string | null;
};

export type ReportsSummary = {
  latest: DailyReportRow | null;
  activeVersion: string;
  recentRuleChanges: {
    id: number;
    reason: string;
    evidenceSummary: string | null;
    createdAt: number;
  }[];
};

function parseWallets(json: string | null): WalletPerf[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json) as WalletPerf[];
    return arr.map((w) => ({
      address: w.address,
      label: w.label ?? null,
      pnl: typeof w.pnl === "number" ? w.pnl : 0,
    }));
  } catch {
    return [];
  }
}

function parseRuleUpdates(json: string | null): RuleUpdate[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as RuleUpdate[];
  } catch {
    return [];
  }
}

export async function getReports(): Promise<ReportsSummary> {
  const latestDb = await db
    .select()
    .from(dailyReports)
    .orderBy(desc(dailyReports.date))
    .limit(1);

  const row = latestDb[0];
  const latest: DailyReportRow | null = row
    ? {
        date: row.date,
        paperPnl: row.paperPnl,
        winRate: row.winRate,
        openPositions: row.openPositions,
        newSignals: row.newSignals,
        copiedSignals: row.copiedSignals,
        watchedSignals: row.watchedSignals,
        skippedSignals: row.skippedSignals,
        bestWallets: parseWallets(row.bestWalletsJson),
        worstWallets: parseWallets(row.worstWalletsJson),
        ruleUpdates: parseRuleUpdates(row.ruleChangesJson),
        summary: row.summary,
      }
    : null;

  const active = await db
    .select({ version: ruleSets.version })
    .from(ruleSets)
    .where(eq(ruleSets.active, true))
    .limit(1);
  const activeVersion = active[0]?.version ?? "unknown";

  const changesDb = await db
    .select({
      id: ruleChanges.id,
      reason: ruleChanges.reason,
      evidenceSummary: ruleChanges.evidenceSummary,
      createdAt: ruleChanges.createdAt,
    })
    .from(ruleChanges)
    .orderBy(desc(ruleChanges.createdAt))
    .limit(5);

  return {
    latest,
    activeVersion,
    recentRuleChanges: changesDb.map((c) => ({
      id: c.id,
      reason: c.reason,
      evidenceSummary: c.evidenceSummary,
      createdAt: c.createdAt.getTime(),
    })),
  };
}