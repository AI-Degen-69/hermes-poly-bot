import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ----- Enums (stored as text; constraints enforced in app layer) -----
// WalletProfile.status:        "track" | "watch" | "ignore"
// DecisionJournal.decision:    "paper_copy" | "watchlist" | "skip"
// PaperTrade.status:           "open" | "closed" | "resolved"
// PaperTrade.side/outcome:     "yes" | "no" (Polymarket outcome side)
// RuleChange.changedBy:        "hermes"

export const leaderboardScans = sqliteTable("leaderboard_scans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(), // "polymarket" | "bullpen"
  scannedAt: integer("scanned_at", { mode: "timestamp_ms" }).notNull(),
  walletCount: integer("wallet_count").notNull(),
  lookbackDays: integer("lookback_days").notNull(),
  rawSummaryJson: text("raw_summary_json").notNull(),
});

export const walletProfiles = sqliteTable("wallet_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  address: text("address").notNull().unique(),
  label: text("label"),
  sourceRank: integer("source_rank"),
  status: text("status").notNull().default("watch"), // track | watch | ignore
  roi30d: real("roi_30d"),
  consistencyScore: real("consistency_score"),
  copyabilityScore: real("copyability_score"),
  oneHitWonderPenalty: real("one_hit_wonder_penalty"),
  globalScore: real("global_score"),
  bestCategory: text("best_category"),
  categoryStrengthsJson: text("category_strengths_json"),
  averageTradeSize: real("average_trade_size"),
  tradeCount30d: integer("trade_count_30d"),
  resolvedTradeCount30d: integer("resolved_trade_count_30d"),
  winRate30d: real("win_rate_30d"),
  averageLiquidity: real("average_liquidity"),
  averageSpread: real("average_spread"),
  averageEntryTiming: real("average_entry_timing"),
  copyabilityNotes: text("copyability_notes"),
  riskNotes: text("risk_notes"),
  lastScannedAt: integer("last_scanned_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
});

export const observedTrades = sqliteTable("observed_trades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  walletAddress: text("wallet_address").notNull(),
  marketId: text("market_id").notNull(),
  conditionId: text("condition_id").notNull(),
  marketQuestion: text("market_question"),
  marketCategory: text("market_category"),
  outcome: text("outcome"), // yes | no
  side: text("side"), // buy | sell
  walletEntryPrice: real("wallet_entry_price"),
  detectedPrice: real("detected_price"),
  size: real("size"),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }),
  rawTradeJson: text("raw_trade_json"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
});

export const marketSnapshots = sqliteTable("market_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  marketId: text("market_id").notNull(),
  conditionId: text("condition_id").notNull(),
  question: text("question"),
  category: text("category"),
  yesPrice: real("yes_price"),
  noPrice: real("no_price"),
  bestBid: real("best_bid"),
  bestAsk: real("best_ask"),
  spread: real("spread"),
  liquidity: real("liquidity"),
  volume: real("volume"),
  timeToResolution: integer("time_to_resolution"), // ms
  collectedAt: integer("collected_at", { mode: "timestamp_ms" }).notNull(),
  rawMarketJson: text("raw_market_json"),
});

export const decisionJournal = sqliteTable("decision_journal", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  observedTradeId: integer("observed_trade_id").references(
    () => observedTrades.id,
  ),
  walletAddress: text("wallet_address").notNull(),
  marketId: text("market_id").notNull(),
  decision: text("decision").notNull(), // paper_copy | watchlist | skip
  copyScore: real("copy_score"),
  confidence: real("confidence"),
  reasonsJson: text("reasons_json"),
  risksJson: text("risks_json"),
  walletQualityScore: real("wallet_quality_score"),
  roiScore: real("roi_score"),
  consistencyScore: real("consistency_score"),
  copyabilityScore: real("copyability_score"),
  categoryFitScore: real("category_fit_score"),
  entryTimingScore: real("entry_timing_score"),
  spreadScore: real("spread_score"),
  liquidityScore: real("liquidity_score"),
  thesisScore: real("thesis_score"),
  simulatedPositionSize: real("simulated_position_size"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
});

export const paperTrades = sqliteTable("paper_trades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  decisionJournalId: integer("decision_journal_id")
    .notNull()
    .references(() => decisionJournal.id),
  walletAddress: text("wallet_address").notNull(),
  marketId: text("market_id").notNull(),
  outcome: text("outcome"), // yes | no
  side: text("side"), // buy | sell
  entryPrice: real("entry_price").notNull(),
  currentPrice: real("current_price").notNull(),
  simulatedPositionSize: real("simulated_position_size").notNull(),
  unrealizedPnl: real("unrealized_pnl").default(0),
  realizedPnl: real("realized_pnl").default(0),
  status: text("status").notNull().default("open"), // open | closed | resolved
  openedAt: integer("opened_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
  closedAt: integer("closed_at", { mode: "timestamp_ms" }),
  resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
});

export const pnlSnapshots = sqliteTable("pnl_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  paperTradeId: integer("paper_trade_id")
    .notNull()
    .references(() => paperTrades.id),
  price: real("price").notNull(),
  pnl: real("pnl").notNull(),
  collectedAt: integer("collected_at", { mode: "timestamp_ms" }).notNull(),
});

export const outcomeReviews = sqliteTable("outcome_reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  decisionJournalId: integer("decision_journal_id").references(
    () => decisionJournal.id,
  ),
  paperTradeId: integer("paper_trade_id").references(() => paperTrades.id),
  reviewTime: integer("review_time", { mode: "timestamp_ms" }).notNull(),
  priceAfter1h: real("price_after_1h"),
  priceAfter6h: real("price_after_6h"),
  priceAfter24h: real("price_after_24h"),
  finalOutcome: text("final_outcome"),
  simulatedPnl: real("simulated_pnl"),
  wasDecisionGood: integer("was_decision_good", { mode: "boolean" }),
  lessonsJson: text("lessons_json"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
});

export const ruleSets = sqliteTable("rule_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  version: text("version").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  rulesJson: text("rules_json").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
});

export const ruleChanges = sqliteTable("rule_changes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  oldRuleSetId: integer("old_rule_set_id").references(() => ruleSets.id),
  newRuleSetId: integer("new_rule_set_id")
    .notNull()
    .references(() => ruleSets.id),
  changedBy: text("changed_by").notNull().default("hermes"),
  reason: text("reason").notNull(),
  evidenceSummary: text("evidence_summary"),
  beforeJson: text("before_json"),
  afterJson: text("after_json"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
});

export const dailyReports = sqliteTable("daily_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  paperPnl: real("paper_pnl"),
  winRate: real("win_rate"),
  openPositions: integer("open_positions"),
  newSignals: integer("new_signals"),
  copiedSignals: integer("copied_signals"),
  watchedSignals: integer("watched_signals"),
  skippedSignals: integer("skipped_signals"),
  bestWalletsJson: text("best_wallets_json"),
  worstWalletsJson: text("worst_wallets_json"),
  ruleChangesJson: text("rule_changes_json"),
  summary: text("summary"),
  sentToTelegram: integer("sent_to_telegram", { mode: "boolean" }).default(
    false,
  ),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch()*1000)`),
});

export type LeaderboardScan = typeof leaderboardScans.$inferSelect;
export type NewLeaderboardScan = typeof leaderboardScans.$inferInsert;
export type WalletProfile = typeof walletProfiles.$inferSelect;
export type NewWalletProfile = typeof walletProfiles.$inferInsert;
export type ObservedTrade = typeof observedTrades.$inferSelect;
export type NewObservedTrade = typeof observedTrades.$inferInsert;
export type MarketSnapshot = typeof marketSnapshots.$inferSelect;
export type NewMarketSnapshot = typeof marketSnapshots.$inferInsert;
export type DecisionJournalRow = typeof decisionJournal.$inferSelect;
export type NewDecisionJournal = typeof decisionJournal.$inferInsert;
export type PaperTrade = typeof paperTrades.$inferSelect;
export type NewPaperTrade = typeof paperTrades.$inferInsert;
export type PnlSnapshot = typeof pnlSnapshots.$inferSelect;
export type NewPnlSnapshot = typeof pnlSnapshots.$inferInsert;
export type OutcomeReview = typeof outcomeReviews.$inferSelect;
export type NewOutcomeReview = typeof outcomeReviews.$inferInsert;
export type RuleSet = typeof ruleSets.$inferSelect;
export type NewRuleSet = typeof ruleSets.$inferInsert;
export type RuleChange = typeof ruleChanges.$inferSelect;
export type NewRuleChange = typeof ruleChanges.$inferInsert;
export type DailyReport = typeof dailyReports.$inferSelect;
export type NewDailyReport = typeof dailyReports.$inferInsert;
