# חלק 1 — Introduction & Layer 1 (Hermes Operator)

## מבוא

Build me a Hermes-powered self-improving Polymarket copy trading bot with a Vercel dashboard.

### Important (חוקי בטיחות)

- This is not financial advice.
- Version one must not place real trades.
- Version one must paper trade only.
- Do not ask for private keys.
- Do not store private keys.
- Do not sign transactions.
- Do not spend money.
- Do not execute real trades.
- The long-term goal is eventual autonomy, but only after paper trading proves the edge.
- If any API fails, show the real error and stop. Do not fake live data.
- Demo or seed data is allowed only if clearly labeled as demo data.
- Use environment variables for optional API keys.
- Redact secrets in logs and UI.

### Goal

Create a working local app and Vercel-ready dashboard that lets Hermes Agent operate a Polymarket copy trading research system.

The system should:

1. Pull the Polymarket or Bullpen leaderboard.
2. Scan the top 500 wallets.
3. Analyze the last 30 days of wallet activity.
4. Score each wallet by ROI, consistency, and copyability.
5. Penalize wallets where profit came from one lucky trade.
6. Rank wallets globally and by category.
7. Skip wallets or markets that are too illiquid to copy.
8. Track selected wallets.
9. Detect new trades.
10. Score whether each new trade is worth copying.
11. Paper trade copy candidates using simulated position sizes between $5 and $20.
12. Update paper PnL every hour.
13. Track final outcomes when markets resolve.
14. Compare the bot-filtered strategy against blindly copying leaderboard wallets.
15. Track missed winners and avoided losers.
16. Automatically update rules based on performance.
17. Record every rule change with version history.
18. Send an end-of-day report through Hermes.
19. Show performance in a clean Max HQ dashboard.

## Layer 1: Hermes Agent operator

The app has two layers. **Layer 1 is Hermes** — it runs the operational loop:

- scheduled leaderboard scans
- wallet profile updates
- new trade monitoring
- paper trade tracking
- hourly PnL updates
- outcome reviews
- automatic rule updates
- end-of-day reports
- important Telegram alerts only
- weekly performance summaries

## Tech stack

- TypeScript
- Next.js
- React
- Tailwind
- SQLite locally
- Prisma or Drizzle
- Vercel-ready architecture
- Polymarket public APIs where possible
- Adapter layer for leaderboard, market data, trades, prices, and outcomes
- No paid services required for version one
