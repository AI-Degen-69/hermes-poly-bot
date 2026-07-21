import { db } from "../db";
import {
  walletProfiles,
  observedTrades,
  ruleSets,
  ruleChanges,
  decisionJournal,
  paperTrades,
  pnlSnapshots,
  outcomeReviews,
  dailyReports,
} from "../db/schema";
import { eq } from "drizzle-orm";

function daysAgoMs(n: number): number {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.getTime();
}

// All data here is DEMO — clearly labeled, for wiring verification only.
async function seed() {
  // Idempotent DEMO seed: wipe all DEMO tables first so edits always apply.
  // Order matters: child tables before parents (FK + UNIQUE/GENERATED).
  await db.delete(pnlSnapshots);
  await db.delete(outcomeReviews);
  await db.delete(paperTrades);
  await db.delete(decisionJournal);
  await db.delete(observedTrades);
  await db.delete(dailyReports);
  await db.delete(walletProfiles);
  await db.delete(ruleChanges);
  await db.delete(ruleSets);

  // Idempotent DEMO seed: wipe and re-insert so edits always apply.
  // (walletProfiles / ruleSets already deleted above in the idempotent block)
  await db.insert(walletProfiles).values([
    {
      address: "demo_wallet_aaa",
      label: "DEMO: Steady ROI",
      sourceRank: 1,
      status: "track",
      roi30d: 0.42,
      consistencyScore: 0.88,
      copyabilityScore: 0.91,
      oneHitWonderPenalty: 0,
      globalScore: 0.84,
      bestCategory: "politics",
      averageTradeSize: 12.5,
      tradeCount30d: 64,
      resolvedTradeCount30d: 51,
      winRate30d: 0.71,
      averageLiquidity: 54000,
      averageSpread: 0.012,
    },
    {
      address: "demo_wallet_bbb",
      label: "DEMO: One-hit wonder",
      sourceRank: 2,
      status: "ignore",
      roi30d: 0.39,
      consistencyScore: 0.21,
      copyabilityScore: 0.18,
      oneHitWonderPenalty: 0.9,
      globalScore: 0.22,
      bestCategory: "crypto",
      averageTradeSize: 9,
      tradeCount30d: 7,
      resolvedTradeCount30d: 5,
      winRate30d: 0.4,
      averageLiquidity: 1200,
      averageSpread: 0.09,
    },
  ]);
  const [rs1] = await db
    .insert(ruleSets)
    .values({
      version: "1.0.0",
      active: true,
      rulesJson: JSON.stringify({
        maxSpread: 0.05,
        minLiquidity: 5000,
        minConsistency: 0.4,
        oneHitWonderPenaltyWeight: 0.8,
      }),
    })
    .returning({ id: ruleSets.id });

  // Rule change history (automatic Hermes adjustments with evidence).
  await db.insert(ruleChanges).values([
    {
      oldRuleSetId: null,
      newRuleSetId: rs1.id,
      changedBy: "hermes",
      reason: "Initial ruleset created from v0 baseline; tightened spread filter after 3 thin-market losses.",
      evidenceSummary: "3/5 demo losses came from markets with spread > 0.08; backtest showed win-rate +6% when maxSpread <= 0.05.",
      beforeJson: JSON.stringify({ maxSpread: 0.1, minLiquidity: 2000, minConsistency: 0.3 }),
      afterJson: JSON.stringify({ maxSpread: 0.05, minLiquidity: 5000, minConsistency: 0.4 }),
    },
  ]);
  console.log("[seed] wallets + v1.0.0 ruleset + rule change history");

  const [d1, d2] = await db
    .insert(decisionJournal)
    .values([
      {
        walletAddress: "demo_wallet_aaa",
        marketId: "mkt_demo_1",
        decision: "paper_copy",
        copyScore: 0.84,
        confidence: 0.78,
        simulatedPositionSize: 15,
        reasonsJson: JSON.stringify(["strong wallet score", "good spread"]),
        risksJson: JSON.stringify(["low liquidity on thin markets"]),
      },
      {
        walletAddress: "demo_wallet_aaa",
        marketId: "mkt_demo_2",
        decision: "paper_copy",
        copyScore: 0.55,
        confidence: 0.62,
        simulatedPositionSize: 8,
        reasonsJson: JSON.stringify(["category fit"]),
        risksJson: JSON.stringify(["wide spread on entry"]),
      },
    ])
    .returning({ id: decisionJournal.id });

  const [t1, t2] = await db
    .insert(paperTrades)
      .values([
        {
          decisionJournalId: d1.id,
          walletAddress: "demo_wallet_aaa",
          marketId: "mkt_demo_1",
          outcome: "yes",
          side: "buy",
          entryPrice: 0.42,
          currentPrice: 0.55,
          simulatedPositionSize: 15,
          unrealizedPnl: 4.64,
          status: "open",
          openedAt: new Date(daysAgoMs(6)),
        },
        {
          decisionJournalId: d2.id,
          walletAddress: "demo_wallet_aaa",
          marketId: "mkt_demo_2",
          outcome: "yes",
          side: "buy",
          entryPrice: 0.3,
          currentPrice: 1.0,
          simulatedPositionSize: 8,
          realizedPnl: 18.67,
          status: "resolved",
          openedAt: new Date(daysAgoMs(6)),
          resolvedAt: new Date(),
        },
      ])
      .returning({ id: paperTrades.id });

    // Outcome reviews: good/bad verdict + what the bot learned (Part 6).
    await db.insert(outcomeReviews).values([
      {
        decisionJournalId: d1.id,
        paperTradeId: t1.id,
        reviewTime: new Date(daysAgoMs(5)),
        priceAfter1h: 0.48,
        priceAfter6h: 0.51,
        priceAfter24h: 0.53,
        finalOutcome: "yes",
        simulatedPnl: 4.64,
        wasDecisionGood: true,
        lessonsJson: JSON.stringify([
          "Strong wallet score + tight spread predicted well; keep category-fit weighting high.",
        ]),
      },
      {
        decisionJournalId: d2.id,
        paperTradeId: t2.id,
        reviewTime: new Date(daysAgoMs(4)),
        priceAfter1h: 0.6,
        priceAfter6h: 0.8,
        priceAfter24h: 0.95,
        finalOutcome: "yes",
        simulatedPnl: 18.67,
        wasDecisionGood: false,
        lessonsJson: JSON.stringify([
          "Entry timing was late; price moved 30% before fill. Tighten entry-timing score threshold.",
          "Wide spread ate ~15% of paper PnL. Skip markets with spread > 5%.",
        ]),
      },
    ]);

    const dailyTotals = [-2.1, 1.5, 5.2, 8.0, 12.4, 18.9, 23.3];
    for (let i = 0; i < dailyTotals.length; i++) {
      const ts = daysAgoMs(6 - i);
      const total = dailyTotals[i];
      await db.insert(pnlSnapshots).values([
        {
          paperTradeId: t1.id,
          price: 0.5,
          pnl: total * 0.6,
          collectedAt: new Date(ts),
        },
        {
          paperTradeId: t2.id,
          price: 0.9,
          pnl: total * 0.4,
          collectedAt: new Date(ts),
        },
      ]);
    console.log("[seed] demo decisions + paper trades + pnl history");

    const today = new Date().toISOString().slice(0, 10);
    await db.delete(dailyReports).where(eq(dailyReports.date, today));
    await db.insert(dailyReports).values({
      date: today,
      paperPnl: 23.3,
      winRate: 1,
      openPositions: 1,
      newSignals: 2,
      copiedSignals: 2,
      watchedSignals: 0,
      skippedSignals: 0,
      bestWalletsJson: JSON.stringify([
        { address: "demo_wallet_aaa", label: "DEMO: Steady ROI", pnl: 18.67 },
      ]),
      worstWalletsJson: JSON.stringify([
        { address: "demo_wallet_bbb", label: "DEMO: Wide Spread", pnl: -3.2 },
      ]),
      ruleChangesJson: JSON.stringify([
        {
          version: "1.0.0",
          reason:
            "Tightened spread filter after 3 thin-market losses; backtest showed win-rate +6% when maxSpread <= 0.05.",
        },
      ]),
      summary:
        "DEMO end-of-day report. Paper PnL positive (+$23.31); 1 open position; 1 rule change applied (spread filter tightened).",
      sentToTelegram: false,
    });
    console.log("[seed] demo daily report for " + today);
  }

  // Idempotent DEMO seed: wipe and re-insert so edits always apply.
  await db.delete(observedTrades);
  await db.insert(observedTrades).values([
      {
        walletAddress: "demo_wallet_aaa",
        marketId: "mkt_demo_1",
        conditionId: "cond_demo_1",
        marketQuestion: "Will the Fed cut rates in July 2026?",
        marketCategory: "politics",
        outcome: "yes",
        side: "buy",
        walletEntryPrice: 0.42,
        detectedPrice: 0.55,
        size: 15,
        timestamp: new Date(daysAgoMs(6)),
        rawTradeJson: JSON.stringify({ source: "polymarket" }),
      },
      {
        walletAddress: "demo_wallet_aaa",
        marketId: "mkt_demo_2",
        conditionId: "cond_demo_2",
        marketQuestion: "Will Ethereum ETF approval happen in Q3?",
        marketCategory: "crypto",
        outcome: "yes",
        side: "buy",
        walletEntryPrice: 0.3,
        detectedPrice: 1.0,
        size: 8,
        timestamp: new Date(daysAgoMs(5)),
        rawTradeJson: JSON.stringify({ source: "polymarket" }),
      },
      {
        walletAddress: "demo_wallet_aaa",
        marketId: "mkt_demo_3",
        conditionId: "cond_demo_3",
        marketQuestion: "Will the Lakers make the playoffs?",
        marketCategory: "sports",
        outcome: "no",
        side: "sell",
        walletEntryPrice: 0.7,
        detectedPrice: 0.65,
        size: 10,
        timestamp: new Date(daysAgoMs(4)),
        rawTradeJson: JSON.stringify({ source: "polymarket" }),
      },
    ]);
  console.log("[seed] demo observed trades (3)");

  console.log("[seed] done");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  });
