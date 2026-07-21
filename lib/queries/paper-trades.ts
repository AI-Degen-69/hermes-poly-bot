import { db } from "@/db";
import { paperTrades, decisionJournal, pnlSnapshots, observedTrades } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type PaperTradeStatus = "open" | "closed" | "resolved";

export interface PaperTradeRow {
  id: number;
  walletAddress: string;
  marketId: string;
  outcome: string | null;
  side: string | null;
  entryPrice: number;
  currentPrice: number;
  positionSize: number;
  unrealizedPnl: number | null;
  realizedPnl: number | null;
  status: PaperTradeStatus;
  openedAt: number;
  closedAt: number | null;
  resolvedAt: number | null;
  reasons: string[];
  marketQuestion: string | null;
  hourlyPnl: number | null;
}

// Hourly PnL = pnl from the snapshot closest to 1h after open.
// SQLite can't reference the outer table inside a correlated subquery,
// so we fetch all snapshots and pick the nearest-to-1h one in JS.
async function getHourlyPnlMap(): Promise<Record<number, number>> {
  const snaps = await db
    .select({
      paperTradeId: pnlSnapshots.paperTradeId,
      collectedAt: pnlSnapshots.collectedAt,
      pnl: pnlSnapshots.pnl,
    })
    .from(pnlSnapshots);

  const best: Record<number, { diff: number; pnl: number }> = {};
  for (const s of snaps) {
    const trade = await db
      .select({ openedAt: paperTrades.openedAt })
      .from(paperTrades)
      .where(eq(paperTrades.id, s.paperTradeId))
      .limit(1);
    if (trade.length === 0) continue;
    const openedAt = trade[0].openedAt.getTime();
    const diff = Math.abs(s.collectedAt.getTime() - (openedAt + 3600000));
    const cur = best[s.paperTradeId];
    if (!cur || diff < cur.diff) {
      best[s.paperTradeId] = { diff, pnl: Number(s.pnl) };
    }
  }
  const out: Record<number, number> = {};
  for (const k of Object.keys(best)) {
    out[Number(k)] = best[Number(k)].pnl;
  }
  return out;
}

export async function getPaperTrades(): Promise<PaperTradeRow[]> {
  const rows = await db
    .select({
      id: paperTrades.id,
      walletAddress: paperTrades.walletAddress,
      marketId: paperTrades.marketId,
      outcome: paperTrades.outcome,
      side: paperTrades.side,
      entryPrice: paperTrades.entryPrice,
      currentPrice: paperTrades.currentPrice,
      positionSize: paperTrades.simulatedPositionSize,
      unrealizedPnl: paperTrades.unrealizedPnl,
      realizedPnl: paperTrades.realizedPnl,
      status: paperTrades.status,
      openedAt: paperTrades.openedAt,
      closedAt: paperTrades.closedAt,
      resolvedAt: paperTrades.resolvedAt,
      reasonsJson: decisionJournal.reasonsJson,
      marketQuestion: observedTrades.marketQuestion,
    })
    .from(paperTrades)
    .leftJoin(
      decisionJournal,
      eq(paperTrades.decisionJournalId, decisionJournal.id),
    )
    .leftJoin(
      observedTrades,
      eq(paperTrades.marketId, observedTrades.marketId),
    )
    .orderBy(desc(paperTrades.openedAt));

  const hourlyMap = await getHourlyPnlMap();

  return rows.map((r) => {
    let reasons: string[] = [];
    try {
      if (r.reasonsJson) reasons = JSON.parse(r.reasonsJson);
    } catch {
      reasons = [];
    }
    return {
      id: r.id,
      walletAddress: r.walletAddress,
      marketId: r.marketId,
      outcome: r.outcome,
      side: r.side,
      entryPrice: Number(r.entryPrice),
      currentPrice: Number(r.currentPrice),
      positionSize: Number(r.positionSize),
      unrealizedPnl: r.unrealizedPnl === null ? null : Number(r.unrealizedPnl),
      realizedPnl: r.realizedPnl === null ? null : Number(r.realizedPnl),
      status: r.status as PaperTradeStatus,
      openedAt: r.openedAt.getTime(),
      closedAt: r.closedAt === null ? null : r.closedAt.getTime(),
      resolvedAt: r.resolvedAt === null ? null : r.resolvedAt.getTime(),
      reasons,
      marketQuestion: r.marketQuestion,
      hourlyPnl: r.id in hourlyMap ? hourlyMap[r.id] : null,
    };
  });
}
