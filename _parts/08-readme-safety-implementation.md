# חלק 8 — README, SAFETY.md & Implementation Order

## README

Include:

- what the bot does
- what the bot does not do
- safety explanation
- setup instructions
- environment variables
- how to run locally
- how to deploy to Vercel
- how to add it to Max HQ
- how Hermes should operate it
- how the leaderboard scan works
- how wallet scoring works
- how paper trading works
- how self-improvement works
- how to interpret the dashboard

## SAFETY.md

Also create `SAFETY.md`. Explain:

- why version one is paper trading only
- why real execution is disabled
- how autonomy could be added later
- risks of stale data
- risks of low liquidity
- risks of wide spreads
- risks of copy trading
- why leaderboard wallets can be misleading
- why private keys should never be stored in the app

## Implementation order

1. Create project structure.
2. Create database schema.
3. Create Polymarket and leaderboard adapters.
4. Build leaderboard scanner.
5. Build wallet profiler.
6. Build trade monitor.
7. Build trade scorer.
8. Build paper trading engine.
9. Build hourly PnL updater.
10. Build outcome reviewer.
11. Build automatic rule updater.
12. Build dashboard.
13. Build daily report generator.
14. Add Hermes operator prompts and cron examples.
15. Add tests.
16. Run tests.
17. Show me what works and what still needs manual setup.

## After building

Run the tests and report:

- commands run
- tests passed
- tests failed
- API blockers
- manual setup needed
- how to run the dashboard locally
- how to deploy it to Vercel
