import { db } from "@/db";
import {
  walletProfiles,
  decisionJournal,
  paperTrades,
} from "@/db/schema";
import { sql, desc, eq, and } from "drizzle-orm";

export interface RankedWallet {
  rank: number;
  address: string;
  label: string | null;
  globalScore: number | null;
  roi30d: number | null;
  consistencyScore: number | null;
  copyabilityScore: number | null;
  oneHitWonderPenalty: number | null;
  bestCategory: string | null;
  status: "track" | "watch" | "ignore";
  copyCandidates: number;
  paperPnl: number;
}

export async function getWalletRankings(): Promise<RankedWallet[]> {
  const base = await db
    .select({
      address: walletProfiles.address,
      label: walletProfiles.label,
      globalScore: walletProfiles.globalScore,
      roi30d: walletProfiles.roi30d,
      consistencyScore: walletProfiles.consistencyScore,
      copyabilityScore: walletProfiles.copyabilityScore,
      oneHitWonderPenalty: walletProfiles.oneHitWonderPenalty,
      bestCategory: walletProfiles.bestCategory,
      status: walletProfiles.status,
    })
    .from(walletProfiles)
    .orderBy(desc(walletProfiles.globalScore));

  // Metrics pulled from separate subqueries so a wallet with N decisions and
  // M paper trades does not double-count via a cross join.
  const copyCounts = await db
    .select({
      address: decisionJournal.walletAddress,
      n: sql<number>`count(*) filter (where ${decisionJournal.decision} = 'paper_copy')`,
    })
    .from(decisionJournal)
    .groupBy(decisionJournal.walletAddress);

  const pnlSums = await db
    .select({
      address: paperTrades.walletAddress,
      pnl: sql<number>`coalesce(sum(coalesce(${paperTrades.unrealizedPnl},0) + coalesce(${paperTrades.realizedPnl},0)), 0)`,
    })
    .from(paperTrades)
    .groupBy(paperTrades.walletAddress);

  const copyMap = new Map(copyCounts.map((r) => [r.address, Number(r.n)]));
  const pnlMap = new Map(pnlSums.map((r) => [r.address, Number(r.pnl)]));

  return base.map((r, i) => ({
    rank: i + 1,
    address: r.address,
    label: r.label,
    globalScore: r.globalScore === null ? null : Number(r.globalScore),
    roi30d: r.roi30d === null ? null : Number(r.roi30d),
    consistencyScore: r.consistencyScore === null ? null : Number(r.consistencyScore),
    copyabilityScore: r.copyabilityScore === null ? null : Number(r.copyabilityScore),
    oneHitWonderPenalty: r.oneHitWonderPenalty === null ? null : Number(r.oneHitWonderPenalty),
    bestCategory: r.bestCategory,
    status: r.status as RankedWallet["status"],
    copyCandidates: copyMap.get(r.address) ?? 0,
    paperPnl: pnlMap.get(r.address) ?? 0,
  }));
}
