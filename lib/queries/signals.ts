import { db } from "@/db";
import {
  decisionJournal,
  observedTrades,
} from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export type SignalDecision = "paper_copy" | "watchlist" | "skip";

export interface TradeSignal {
  id: number;
  walletAddress: string;
  marketId: string;
  decision: SignalDecision;
  score: number | null;
  confidence: number | null;
  reasons: string[];
  risks: string[];
  marketQuestion: string | null;
  marketCategory: string | null;
  outcome: string | null;
  side: string | null;
  walletEntryPrice: number | null;
  detectedPrice: number | null;
  size: number | null;
  // price movement since wallet entry (signed, fraction)
  movement: number | null;
  createdAt: number | null;
}

export async function getTradeSignals(): Promise<TradeSignal[]> {
  const rows = await db
    .select({
      id: decisionJournal.id,
      walletAddress: decisionJournal.walletAddress,
      marketId: decisionJournal.marketId,
      decision: decisionJournal.decision,
      score: decisionJournal.copyScore,
      confidence: decisionJournal.confidence,
      reasonsJson: decisionJournal.reasonsJson,
      risksJson: decisionJournal.risksJson,
      marketQuestion: observedTrades.marketQuestion,
      marketCategory: observedTrades.marketCategory,
      outcome: observedTrades.outcome,
      side: observedTrades.side,
      walletEntryPrice: observedTrades.walletEntryPrice,
      detectedPrice: observedTrades.detectedPrice,
      size: observedTrades.size,
      createdAt: decisionJournal.createdAt,
    })
    .from(decisionJournal)
    .leftJoin(
      observedTrades,
      sql`${observedTrades.walletAddress} = ${decisionJournal.walletAddress} and ${observedTrades.marketId} = ${decisionJournal.marketId}`,
    )
    .orderBy(desc(decisionJournal.createdAt));

  return rows.map((r) => {
    let reasons: string[] = [];
    let risks: string[] = [];
    try {
      if (r.reasonsJson) reasons = JSON.parse(r.reasonsJson);
    } catch {
      reasons = [];
    }
    try {
      if (r.risksJson) risks = JSON.parse(r.risksJson);
    } catch {
      risks = [];
    }

    let movement: number | null = null;
    if (
      r.walletEntryPrice !== null &&
      r.detectedPrice !== null &&
      r.walletEntryPrice !== 0
    ) {
      movement = (r.detectedPrice - r.walletEntryPrice) / r.walletEntryPrice;
    }

    return {
      id: r.id,
      walletAddress: r.walletAddress,
      marketId: r.marketId,
      decision: r.decision as SignalDecision,
      score: r.score === null ? null : Number(r.score),
      confidence: r.confidence === null ? null : Number(r.confidence),
      reasons,
      risks,
      marketQuestion: r.marketQuestion,
      marketCategory: r.marketCategory,
      outcome: r.outcome,
      side: r.side,
      walletEntryPrice:
        r.walletEntryPrice === null ? null : Number(r.walletEntryPrice),
      detectedPrice: r.detectedPrice === null ? null : Number(r.detectedPrice),
      size: r.size === null ? null : Number(r.size),
      movement,
      createdAt: r.createdAt.getTime(),
    };
  });
}
