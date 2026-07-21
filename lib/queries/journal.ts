import { db } from "@/db";
import {
  decisionJournal,
  observedTrades,
  outcomeReviews,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type DecisionType = "paper_copy" | "watchlist" | "skip";

export interface ScoreBreakdown {
  copyScore: number | null;
  confidence: number | null;
  walletQuality: number | null;
  roi: number | null;
  consistency: number | null;
  copyability: number | null;
  categoryFit: number | null;
  entryTiming: number | null;
  spread: number | null;
  liquidity: number | null;
  thesis: number | null;
}

export interface OutcomeReview {
  wasDecisionGood: boolean | null;
  lessons: string[];
  finalOutcome: string | null;
  simulatedPnl: number | null;
}

export interface DecisionJournalRow {
  id: number;
  walletAddress: string;
  marketId: string;
  marketQuestion: string | null;
  decision: DecisionType;
  score: ScoreBreakdown;
  reasons: string[];
  risks: string[];
  createdAt: number;
  outcome: OutcomeReview;
}

export async function getDecisionJournal(): Promise<DecisionJournalRow[]> {
  const rows = await db
    .select({
      id: decisionJournal.id,
      walletAddress: decisionJournal.walletAddress,
      marketId: decisionJournal.marketId,
      marketQuestion: observedTrades.marketQuestion,
      decision: decisionJournal.decision,
      copyScore: decisionJournal.copyScore,
      confidence: decisionJournal.confidence,
      walletQuality: decisionJournal.walletQualityScore,
      roi: decisionJournal.roiScore,
      consistency: decisionJournal.consistencyScore,
      copyability: decisionJournal.copyabilityScore,
      categoryFit: decisionJournal.categoryFitScore,
      entryTiming: decisionJournal.entryTimingScore,
      spread: decisionJournal.spreadScore,
      liquidity: decisionJournal.liquidityScore,
      thesis: decisionJournal.thesisScore,
      reasonsJson: decisionJournal.reasonsJson,
      risksJson: decisionJournal.risksJson,
      createdAt: decisionJournal.createdAt,
      wasDecisionGood: outcomeReviews.wasDecisionGood,
      lessonsJson: outcomeReviews.lessonsJson,
      finalOutcome: outcomeReviews.finalOutcome,
      simulatedPnl: outcomeReviews.simulatedPnl,
    })
    .from(decisionJournal)
    .leftJoin(
      observedTrades,
      eq(decisionJournal.marketId, observedTrades.marketId),
    )
    .leftJoin(
      outcomeReviews,
      eq(decisionJournal.id, outcomeReviews.decisionJournalId),
    )
    .orderBy(desc(decisionJournal.createdAt));

  return rows.map((r) => {
    const parse = (j: string | null): string[] => {
      if (!j) return [];
      try {
        const v = JSON.parse(j);
        return Array.isArray(v) ? v.map(String) : [];
      } catch {
        return [];
      }
    };
    return {
      id: r.id,
      walletAddress: r.walletAddress,
      marketId: r.marketId,
      marketQuestion: r.marketQuestion,
      decision: r.decision as DecisionType,
      score: {
        copyScore: r.copyScore === null ? null : Number(r.copyScore),
        confidence: r.confidence === null ? null : Number(r.confidence),
        walletQuality: r.walletQuality === null ? null : Number(r.walletQuality),
        roi: r.roi === null ? null : Number(r.roi),
        consistency: r.consistency === null ? null : Number(r.consistency),
        copyability: r.copyability === null ? null : Number(r.copyability),
        categoryFit: r.categoryFit === null ? null : Number(r.categoryFit),
        entryTiming: r.entryTiming === null ? null : Number(r.entryTiming),
        spread: r.spread === null ? null : Number(r.spread),
        liquidity: r.liquidity === null ? null : Number(r.liquidity),
        thesis: r.thesis === null ? null : Number(r.thesis),
      },
      reasons: parse(r.reasonsJson),
      risks: parse(r.risksJson),
      createdAt: r.createdAt.getTime(),
      outcome: {
        wasDecisionGood:
          r.wasDecisionGood === null ? null : Boolean(r.wasDecisionGood),
        lessons: parse(r.lessonsJson),
        finalOutcome: r.finalOutcome,
        simulatedPnl:
          r.simulatedPnl === null ? null : Number(r.simulatedPnl),
      },
    };
  });
}
