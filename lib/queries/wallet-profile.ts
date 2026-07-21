import { db } from "@/db";
import {
  walletProfiles,
  observedTrades,
  paperTrades,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface ProfileTrade {
  id: number;
  marketQuestion: string | null;
  marketCategory: string | null;
  outcome: string | null;
  side: string | null;
  size: number | null;
  timestamp: number | null;
}

export interface WalletProfileData {
  address: string;
  label: string | null;
  status: "track" | "watch" | "ignore";
  roi30d: number | null;
  tradeCount30d: number | null;
  resolvedTradeCount30d: number | null;
  winRate30d: number | null;
  averageTradeSize: number | null;
  categoryStrengths: Record<string, number> | null;
  averageLiquidity: number | null;
  averageSpread: number | null;
  averageEntryTiming: number | null;
  copyabilityNotes: string | null;
  riskNotes: string | null;
  copyable: boolean;
  copyabilityScore: number | null;
  oneHitWonderPenalty: number | null;
  bestCategory: string | null;
  recentTrades: ProfileTrade[];
  paperPnl: number;
  paperOpenPositions: number;
}

export async function getWalletProfile(
  address: string,
): Promise<WalletProfileData | null> {
  const prof = await db
    .select()
    .from(walletProfiles)
    .where(eq(walletProfiles.address, address))
    .limit(1);

  if (prof.length === 0) return null;
  const p = prof[0];

  const trades = await db
    .select({
      id: observedTrades.id,
      marketQuestion: observedTrades.marketQuestion,
      marketCategory: observedTrades.marketCategory,
      outcome: observedTrades.outcome,
      side: observedTrades.side,
      size: observedTrades.size,
      timestamp: observedTrades.timestamp,
    })
    .from(observedTrades)
    .where(eq(observedTrades.walletAddress, address))
    .orderBy(desc(observedTrades.timestamp))
    .limit(10);

  const pnlRow = await db
    .select({
      pnl: sql<number>`coalesce(sum(coalesce(${paperTrades.unrealizedPnl},0) + coalesce(${paperTrades.realizedPnl},0)), 0)`,
      open: sql<number>`coalesce(count(*) filter (where ${paperTrades.status} = 'open'), 0)`,
    })
    .from(paperTrades)
    .where(eq(paperTrades.walletAddress, address));

  let categoryStrengths: Record<string, number> | null = null;
  if (p.categoryStrengthsJson) {
    try {
      categoryStrengths = JSON.parse(p.categoryStrengthsJson);
    } catch {
      categoryStrengths = null;
    }
  }

  return {
    address: p.address,
    label: p.label,
    status: p.status as WalletProfileData["status"],
    roi30d: p.roi30d === null ? null : Number(p.roi30d),
    tradeCount30d: p.tradeCount30d,
    resolvedTradeCount30d: p.resolvedTradeCount30d,
    winRate30d: p.winRate30d === null ? null : Number(p.winRate30d),
    averageTradeSize: p.averageTradeSize === null ? null : Number(p.averageTradeSize),
    categoryStrengths,
    averageLiquidity: p.averageLiquidity === null ? null : Number(p.averageLiquidity),
    averageSpread: p.averageSpread === null ? null : Number(p.averageSpread),
    averageEntryTiming: p.averageEntryTiming === null ? null : Number(p.averageEntryTiming),
    copyabilityNotes: p.copyabilityNotes,
    riskNotes: p.riskNotes,
    copyable: (p.copyabilityScore ?? 0) >= 0.5,
    copyabilityScore: p.copyabilityScore === null ? null : Number(p.copyabilityScore),
    oneHitWonderPenalty: p.oneHitWonderPenalty === null ? null : Number(p.oneHitWonderPenalty),
    bestCategory: p.bestCategory,
    recentTrades: trades.map((t) => ({
      id: t.id,
      marketQuestion: t.marketQuestion,
      marketCategory: t.marketCategory,
      outcome: t.outcome,
      side: t.side,
      size: t.size === null ? null : Number(t.size),
      timestamp: t.timestamp === null ? null : t.timestamp.getTime(),
    })),
    paperPnl: Number(pnlRow[0]?.pnl ?? 0),
    paperOpenPositions: Number(pnlRow[0]?.open ?? 0),
  };
}

export async function getTrackedAddresses(): Promise<string[]> {
  const rows = await db
    .select({ address: walletProfiles.address })
    .from(walletProfiles)
    .where(eq(walletProfiles.status, "track"));
  return rows.map((r) => r.address);
}
