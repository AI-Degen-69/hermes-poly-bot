# Hermes Polymarket Copy Trading Bot — Build Prompt (מפת חלקים)

אינדקס ניווט לפיצול של `prompt.txt`. המסמך המקורי מתחלק לשתי שכבות:

- **שכבה 1 — הרמס (האופרטור)**: מריץ את הלולאה התפעולית (סריקות, ניטור, דיווח).
- **שכבה 2 — הדשבורד (Vercel)**: 9 עמודים שמחולקים כאן ל-3 קבצים (עמודים 1–3, 4–6, 7–9).

## חלקים

1. [Introduction & Layer 1 (Hermes Operator)](01-intro-and-hermes-operator.md) — חוקי בטיחות, מטרה, שכבה 1 (הרמס), Tech stack
2. [Dashboard Pages 1–3](02-dashboard-pages-1-3.md) — Overview, Wallet Rankings, Wallet Profile
3. [Dashboard Pages 4–6](03-dashboard-pages-4-6.md) — Trade Signals, Paper Trades, Decision Journal
4. [Dashboard Pages 7–9](04-dashboard-pages-7-9.md) — Performance, Rules, Reports
5. [Database Models](05-database-models.md) — כל המודלים: LeaderboardScan → DailyReport
6. [Scoring & Self-Improvement](06-scoring-and-self-improvement.md) — סקורינג ארנקים/טריידים, פייפר-טריידינג, בנצ'מרקים, עדכון חוקים אוטומטי
7. [Reporting, Alerts, Tests, Commands](07-reporting-alerts-tests-commands.md) — דוחות יומיים, התראות טלגרם, תוכנית טסטים, קומנדות npm
8. [README, SAFETY.md & Implementation Order](08-readme-safety-implementation.md) — תוכן README/SAFETY.md, סדר בנייה ב-17 צעדים, דיווח סיום

## הערות

- מקור האמת הוא `prompt.txt` (502 שורות) — הפיצול מכסה אותו במלואו, ללא פערים וללא חפיפה.
- חלק 1 מבודד את שכבה 1; חלקים 2–4 הם תשעת עמודי הדשבורד מקובצים.
