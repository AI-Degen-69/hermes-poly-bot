import { db } from "@/db";
import {
  paperTrades,
  walletProfiles,
  decisionJournal,
  dailyReports,
  ruleSets,
  ruleChanges,
  pnlSnapshots,
} from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";

export interface OverviewMetrics {
  totalPaperPnl: number;
  winRate: number | null;
  openPaperPositions: number;
  activeTrackedWallets: number;
  copyCandidatesToday: number;
  endOfDayReportStatus: "sent" | "pending" | "none";
  latestRuleVersion: string | null;
  ruleChangeCount: number;
}

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const [pnl] = await db
    .select({
      total: sql<number>`coalesce(sum(coalesce(${paperTrades.unrealizedPnl},0) + coalesce(${paperTrades.realizedPnl},0)), 0)`,
      open: sql<number>`coalesce(count(*) filter (where ${paperTrades.status} = 'open'), 0)`,
      resolved: sql<number>`coalesce(count(*) filter (where ${paperTrades.status} = 'resolved'), 0)`,
      wins: sql<number>`coalesce(count(*) filter (where ${paperTrades.status} = 'resolved' and ${paperTrades.realizedPnl} > 0), 0)`,
    })
    .from(paperTrades);

  const [wallets] = await db
    .select({
      tracked: sql<number>`coalesce(count(*) filter (where ${walletProfiles.status} = 'track'), 0)`,
    })
    .from(walletProfiles);

  const [candidates] = await db
    .select({ n: sql<number>`count(*)` })
    .from(decisionJournal)
    .where(
      sql`${decisionJournal.decision} = 'paper_copy' and ${decisionJournal.createdAt} >= ${startOfTodayMs()}`,
    );

  const today = new Date().toISOString().slice(0, 10);
  const [report] = await db
    .select({ sent: dailyReports.sentToTelegram })
    .from(dailyReports)
    .where(eq(dailyReports.date, today))
    .limit(1);

  const [rule] = await db
    .select({ version: ruleSets.version })
    .from(ruleSets)
    .where(eq(ruleSets.active, true))
    .orderBy(desc(ruleSets.createdAt))
    .limit(1);

  const [changes] = await db
    .select({ n: sql<number>`count(*)` })
    .from(ruleChanges);

  const resolved = Number(pnl.resolved);
  const winRate = resolved > 0 ? Number(pnl.wins) / resolved : null;

  return {
    totalPaperPnl: Number(pnl.total),
    winRate,
    openPaperPositions: Number(pnl.open),
    activeTrackedWallets: Number(wallets.tracked),
    copyCandidatesToday: Number(candidates?.n ?? 0),
    endOfDayReportStatus: report
      ? report.sent
        ? "sent"
        : "pending"
      : "none",
    latestRuleVersion: rule?.version ?? null,
    ruleChangeCount: Number(changes?.n ?? 0),
  };
}

export interface PnlPoint {
  t: number;
  pnl: number;
}

export async function getPnlSeries(): Promise<PnlPoint[]> {
  const rows = await db
    .select({
      t: pnlSnapshots.collectedAt,
      pnl: sql<number>`coalesce(sum(${pnlSnapshots.pnl}), 0)`,
    })
    .from(pnlSnapshots)
    .groupBy(pnlSnapshots.collectedAt)
    .orderBy(pnlSnapshots.collectedAt);

  return rows.map((r) => ({
    t: r.t instanceof Date ? r.t.getTime() : Number(r.t),
    pnl: Number(r.pnl),
  }));
}
