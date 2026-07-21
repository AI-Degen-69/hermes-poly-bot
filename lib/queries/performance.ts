import { db } from "@/db";
import {
  pnlSnapshots,
  paperTrades,
  outcomeReviews,
  decisionJournal,
  observedTrades,
} from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface PnlPoint {
  t: number; // collected_at ms
  pnl: number;
}

export interface CategoryPerf {
  category: string;
  trades: number;
  pnl: number;
  winRate: number | null;
}

export interface WalletPerf {
  wallet: string;
  trades: number;
  pnl: number;
  winRate: number | null;
}

export interface StrategyCompare {
  botFiltered: { copies: number; wins: number; pnl: number };
  blindCopy: { copies: number; wins: number; pnl: number };
}

export interface PerformanceSummary {
  totalPnl: number;
  winRate: number | null;
  openPositions: number;
  resolvedTrades: number;
  missedWinners: number;
  avoidedLosers: number;
  pnlCurve: PnlPoint[];
  categoryPerf: CategoryPerf[];
  walletPerf: WalletPerf[];
  strategy: StrategyCompare;
}

export async function getPerformance(): Promise<PerformanceSummary> {
  // Raw rows
  const snaps = await db
    .select({
      tradeId: pnlSnapshots.paperTradeId,
      t: pnlSnapshots.collectedAt,
      pnl: pnlSnapshots.pnl,
    })
    .from(pnlSnapshots)
    .orderBy(sql`${pnlSnapshots.paperTradeId}, ${pnlSnapshots.collectedAt}`);

  const trades = await db
    .select({
      id: paperTrades.id,
      wallet: paperTrades.walletAddress,
      marketId: paperTrades.marketId,
      status: paperTrades.status,
      realizedPnl: paperTrades.realizedPnl,
    })
    .from(paperTrades);

  const decisions = await db
    .select({
      id: decisionJournal.id,
      marketId: decisionJournal.marketId,
      decision: decisionJournal.decision,
      copyScore: decisionJournal.copyScore,
      observedTradeId: decisionJournal.observedTradeId,
    })
    .from(decisionJournal);

  const reviews = await db
    .select({
      decisionJournalId: outcomeReviews.decisionJournalId,
      wasGood: outcomeReviews.wasDecisionGood,
    })
    .from(outcomeReviews);

  const observed = await db
    .select({
      id: observedTrades.id,
      marketId: observedTrades.marketId,
      category: observedTrades.marketCategory,
    })
    .from(observedTrades);

  // Maps
  // Fallback lookup by marketId (decisions may not carry observedTradeId).
  const obsByMarket = new Map<string, { category: string }>();
  for (const o of observed) obsByMarket.set(o.marketId, { category: o.category ?? "unknown" });

  const decById = new Map<number, (typeof decisions)[number]>();
  for (const d of decisions) decById.set(d.id, d);

  const reviewByDec = new Map<number, boolean>();
  for (const r of reviews) reviewByDec.set(r.decisionJournalId ?? -1, Boolean(r.wasGood));

  // PnL curve (sum across trades per timestamp)
  const curveMap: Record<number, number> = {};
  for (const s of snaps) {
    const k = s.t.getTime();
    curveMap[k] = (curveMap[k] ?? 0) + Number(s.pnl);
  }
  const pnlCurve: PnlPoint[] = Object.keys(curveMap).map((k) => ({
    t: Number(k),
    pnl: Number(curveMap[Number(k)].toFixed(2)),
  }));
  pnlCurve.sort((a, b) => a.t - b.t);

  // Wallet performance
  const walletMap: Record<string, { trades: number; pnl: number; wins: number; resolved: number }> = {};
  for (const t of trades) {
    const w = walletMap[t.wallet] ?? { trades: 0, pnl: 0, wins: 0, resolved: 0 };
    w.trades += 1;
    w.pnl += Number(t.realizedPnl ?? 0);
    if (t.status === "resolved") {
      w.resolved += 1;
      // win if realized pnl positive
      if (Number(t.realizedPnl ?? 0) > 0) w.wins += 1;
    }
    walletMap[t.wallet] = w;
  }
  const walletPerf: WalletPerf[] = Object.keys(walletMap).map((wallet) => {
    const v = walletMap[wallet];
    return {
      wallet,
      trades: v.trades,
      pnl: Number(v.pnl.toFixed(2)),
      winRate: v.resolved > 0 ? Number((v.wins / v.resolved).toFixed(2)) : null,
    };
  });

  // Category performance (via observed_trades -> decision_journal -> paper_trades)
  const catMap: Record<string, { trades: number; pnl: number; wins: number; resolved: number }> = {};
  const tradeByMarket: Record<string, (typeof trades)[number]> = {};
  for (const t of trades) tradeByMarket[t.marketId] = t;
  for (const d of decisions) {
    const obs = obsByMarket.get(d.marketId);
    if (!obs) continue;
    const cat = obs.category || "unknown";
    const c = catMap[cat] ?? { trades: 0, pnl: 0, wins: 0, resolved: 0 };
    c.trades += 1;
    const t = tradeByMarket[d.marketId];
    if (t) {
      c.pnl += Number(t.realizedPnl ?? 0);
      if (t.status === "resolved") {
        c.resolved += 1;
        if (Number(t.realizedPnl ?? 0) > 0) c.wins += 1;
      }
    }
    catMap[cat] = c;
  }
  const categoryPerf: CategoryPerf[] = Object.keys(catMap).map((category) => {
    const v = catMap[category];
    return {
      category,
      trades: v.trades,
      pnl: Number(v.pnl.toFixed(2)),
      winRate: v.resolved > 0 ? Number((v.wins / v.resolved).toFixed(2)) : null,
    };
  });

  // Strategy compare: bot-filtered (copy_score >= 0.7) vs blind copy (all copies)
  let botCopies = 0, botWins = 0, botPnl = 0;
  let blindCopies = 0, blindWins = 0, blindPnl = 0;
  for (const d of decisions) {
    if (d.decision !== "paper_copy") continue;
    const t = tradeByMarket[d.marketId];
    const pnl = t ? Number(t.realizedPnl ?? 0) : 0;
    const won = t && t.status === "resolved" ? Number(t.realizedPnl ?? 0) > 0 : false;
    blindCopies += 1;
    blindPnl += pnl;
    if (won) blindWins += 1;
    if (Number(d.copyScore ?? 0) >= 0.7) {
      botCopies += 1;
      botPnl += pnl;
      if (won) botWins += 1;
    }
  }
  const strategy: StrategyCompare = {
    botFiltered: {
      copies: botCopies,
      wins: botWins,
      pnl: Number(botPnl.toFixed(2)),
    },
    blindCopy: {
      copies: blindCopies,
      wins: blindWins,
      pnl: Number(blindPnl.toFixed(2)),
    },
  };

  // Totals
  const totalPnl = Number(
    (await db.select({ s: sql<number>`coalesce(sum(${paperTrades.realizedPnl}),0)` }).from(paperTrades))[0].s,
  );
  const openPositions = trades.filter((t) => t.status === "open").length;
  const resolvedTrades = trades.filter((t) => t.status === "resolved").length;

  // Win rate from outcome_reviews (was_decision_good)
  let good = 0, judged = 0;
  for (const r of reviews) {
    judged += 1;
    if (r.wasGood === true) good += 1;
  }
  const winRate = judged > 0 ? Number((good / judged).toFixed(2)) : null;

  // Missed winners / avoided losers:
  // A "missed winner" = decision was skip but the realized outcome was profitable (simulatedPnl > 0).
  // An "avoided loser" = decision was skip and the paper trade would have lost (simulatedPnl < 0).
  // We approximate using outcome_reviews simulated_pnl for skipped decisions.
  const skipReviews = await db
    .select({
      decisionId: outcomeReviews.decisionJournalId,
      pnl: outcomeReviews.simulatedPnl,
    })
    .from(outcomeReviews)
    .leftJoin(decisionJournal, eq(outcomeReviews.decisionJournalId, decisionJournal.id))
    .where(eq(decisionJournal.decision, "skip"));

  let missedWinners = 0, avoidedLosers = 0;
  for (const s of skipReviews) {
    const pnl = Number(s.pnl ?? 0);
    if (pnl > 0) missedWinners += 1;
    else if (pnl < 0) avoidedLosers += 1;
  }

  return {
    totalPnl: Number(totalPnl.toFixed(2)),
    winRate,
    openPositions,
    resolvedTrades,
    missedWinners,
    avoidedLosers,
    pnlCurve,
    categoryPerf,
    walletPerf,
    strategy,
  };
}
