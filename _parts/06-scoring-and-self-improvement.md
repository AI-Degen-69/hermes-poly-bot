# חלק 6 — Scoring & Self-Improvement

## Wallet scoring

Score wallets by:

- ROI
- consistency
- copyability
- category edge
- liquidity quality
- entry timing
- trade frequency
- resolved trade performance
- one-hit-wonder penalty

A wallet should be penalized if:

- most profit came from one trade
- trades are too illiquid
- price moves too far after entry
- edge only exists in one old market
- there are not enough resolved trades
- spread is usually too wide
- the bot cannot realistically follow entries

## Trade scoring

Score each new wallet trade by:

- wallet global score
- wallet category score
- current market price
- wallet entry price
- price movement since wallet entry
- spread
- liquidity
- time to resolution
- current rule thresholds
- thesis clarity

## Decision labels

- **paper_copy**: strong enough to simulate a copy trade
- **watchlist**: interesting but not clean enough
- **skip**: too late, too illiquid, weak wallet, bad category fit, or poor setup

## Paper trading

- For every paper_copy decision, create a PaperTrade.
- Simulated bet size should be between $5 and $20.
- Higher confidence can use larger simulated size.
- Update PnL every hour.
- Close or resolve paper trades when the market resolves or when rules say the trade should be exited.
- Track paper PnL over time.

## Benchmarks

Compare:

1. Bot-filtered paper trades
2. Blind copy of leaderboard wallets
3. Watchlist trades
4. Skipped trades

Track:

- missed winners
- avoided losers
- bad copies
- good skips
- late entries avoided
- spread losses avoided

## Self-improvement

The system should automatically update rules.

It should not ask for approval before changing paper-trading rules.

But every rule change must be logged and explained.

For each rule change, store:

- what changed
- why it changed
- evidence used
- before value
- after value
- expected improvement
- timestamp
- new rule version

Examples:

- lower max spread threshold if spread-heavy trades underperform
- raise minimum liquidity if low-liquidity trades perform poorly
- downgrade wallets with poor recent paper performance
- mark wallets as category-specific
- reduce allowed price movement if late entries lose
- increase consistency weighting if high-ROI wallets are too volatile
