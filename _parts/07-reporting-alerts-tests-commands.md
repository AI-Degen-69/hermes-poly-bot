# חלק 7 — Reporting, Alerts, Tests, Commands

## Reports

Create an end-of-day report that Hermes can send to Telegram.

The report should include:

- paper PnL today
- total paper PnL
- win rate
- best paper trade
- worst paper trade
- best wallet today
- worst wallet today
- rule changes made
- top lesson learned
- whether the bot-filtered strategy beat blind copy today
- what to watch tomorrow

## Alerts

Keep Telegram alerts minimal.

Minimum one end-of-day report per day.

Only send additional alerts for genuinely important events, like:

- a very high-confidence paper trade
- a major rule change
- a wallet being upgraded or downgraded significantly
- a performance drawdown warning

## Testing

Create tests for:

- wallet scoring
- one-hit-wonder penalty
- copyability score
- trade scoring
- paper trade creation
- hourly PnL updates
- rule versioning
- automatic rule changes
- benchmark comparison
- read-only safety
- no real trade execution

## Commands

- `npm run dev`
- `npm run db:migrate`
- `npm run seed`
- `npm run scan:leaderboard`
- `npm run scan:wallets`
- `npm run monitor:trades`
- `npm run score:trades`
- `npm run paper:update-pnl`
- `npm run review:outcomes`
- `npm run update:rules`
- `npm run report:daily`
- `npm run test`
