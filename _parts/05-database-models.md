# חלק 5 — Database Models

## LeaderboardScan

- `id`
- `source`
- `scannedAt`
- `walletCount`
- `lookbackDays`
- `rawSummaryJson`

## WalletProfile

- `id`
- `address`
- `label`
- `sourceRank`
- `status`: track, watch, ignore
- `roi30d`
- `consistencyScore`
- `copyabilityScore`
- `oneHitWonderPenalty`
- `globalScore`
- `bestCategory`
- `categoryStrengthsJson`
- `averageTradeSize`
- `tradeCount30d`
- `resolvedTradeCount30d`
- `winRate30d`
- `averageLiquidity`
- `averageSpread`
- `averageEntryTiming`
- `copyabilityNotes`
- `riskNotes`
- `lastScannedAt`
- `createdAt`
- `updatedAt`

## ObservedTrade

- `id`
- `walletAddress`
- `marketId`
- `conditionId`
- `marketQuestion`
- `marketCategory`
- `outcome`
- `side`
- `walletEntryPrice`
- `detectedPrice`
- `size`
- `timestamp`
- `rawTradeJson`
- `createdAt`

## MarketSnapshot

- `id`
- `marketId`
- `conditionId`
- `question`
- `category`
- `yesPrice`
- `noPrice`
- `bestBid`
- `bestAsk`
- `spread`
- `liquidity`
- `volume`
- `timeToResolution`
- `collectedAt`
- `rawMarketJson`

## DecisionJournal

- `id`
- `observedTradeId`
- `walletAddress`
- `marketId`
- `decision`: paper_copy, watchlist, skip
- `copyScore`
- `confidence`
- `reasonsJson`
- `risksJson`
- `walletQualityScore`
- `roiScore`
- `consistencyScore`
- `copyabilityScore`
- `categoryFitScore`
- `entryTimingScore`
- `spreadScore`
- `liquidityScore`
- `thesisScore`
- `simulatedPositionSize`
- `createdAt`

## PaperTrade

- `id`
- `decisionJournalId`
- `walletAddress`
- `marketId`
- `outcome`
- `side`
- `entryPrice`
- `currentPrice`
- `simulatedPositionSize`
- `unrealizedPnl`
- `realizedPnl`
- `status`: open, closed, resolved
- `openedAt`
- `closedAt`
- `resolvedAt`

## PnlSnapshot

- `id`
- `paperTradeId`
- `price`
- `pnl`
- `collectedAt`

## OutcomeReview

- `id`
- `decisionJournalId`
- `paperTradeId`
- `reviewTime`
- `priceAfter1h`
- `priceAfter6h`
- `priceAfter24h`
- `finalOutcome`
- `simulatedPnl`
- `wasDecisionGood`
- `lessonsJson`
- `createdAt`

## RuleSet

- `id`
- `version`
- `active`
- `rulesJson`
- `createdAt`
- `updatedAt`

## RuleChange

- `id`
- `oldRuleSetId`
- `newRuleSetId`
- `changedBy`: hermes
- `reason`
- `evidenceSummary`
- `beforeJson`
- `afterJson`
- `createdAt`

## DailyReport

- `id`
- `date`
- `paperPnl`
- `winRate`
- `openPositions`
- `newSignals`
- `copiedSignals`
- `watchedSignals`
- `skippedSignals`
- `bestWalletsJson`
- `worstWalletsJson`
- `ruleChangesJson`
- `summary`
- `sentToTelegram`
- `createdAt`
