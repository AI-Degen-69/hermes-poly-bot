import type { DecisionJournalRow, ScoreBreakdown } from "@/lib/queries/journal";

const DECISION_STYLE: Record<DecisionJournalRow["decision"], string> = {
  paper_copy: "bg-[var(--color-track)]/10 text-[var(--color-track)]",
  watchlist: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  skip: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
};

const DECISION_LABEL: Record<DecisionJournalRow["decision"], string> = {
  paper_copy: "Copy",
  watchlist: "Watch",
  skip: "Skip",
};

const SCORE_FIELDS: { key: keyof ScoreBreakdown; label: string }[] = [
  { key: "copyScore", label: "Copy" },
  { key: "confidence", label: "Confidence" },
  { key: "walletQuality", label: "Wallet" },
  { key: "roi", label: "ROI" },
  { key: "consistency", label: "Consistency" },
  { key: "copyability", label: "Copyability" },
  { key: "categoryFit", label: "Category" },
  { key: "entryTiming", label: "Entry" },
  { key: "spread", label: "Spread" },
  { key: "liquidity", label: "Liquidity" },
  { key: "thesis", label: "Thesis" },
];

function pct(n: number | null): string {
  return n === null ? "—" : `${(n * 100).toFixed(0)}%`;
}

function money(n: number | null): string {
  return n === null ? "—" : `$${n.toFixed(2)}`;
}

function ScoreBar({ value }: { value: number | null }) {
  const p = value === null ? 0 : Math.round(value * 100);
  const color =
    value === null
      ? "bg-[var(--color-border)]"
      : value >= 0.7
        ? "bg-[var(--color-track)]"
        : value >= 0.4
          ? "bg-[var(--color-accent)]"
          : "bg-[var(--color-muted)]";
  return (
    <div className="h-1.5 w-full rounded-full bg-[var(--color-border)]/40">
      <div
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

export function JournalView({ rows }: { rows: DecisionJournalRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center text-[var(--color-muted)] text-sm">
        No decisions recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((d) => {
        const good = d.outcome.wasDecisionGood;
        const verdictStyle =
          good === null
            ? "bg-[var(--color-muted)]/10 text-[var(--color-muted)]"
            : good
              ? "bg-[var(--color-track)]/10 text-[var(--color-track)]"
              : "bg-[var(--color-accent)]/10 text-[var(--color-accent)]";
        const verdictLabel =
          good === null ? "Pending" : good ? "Good" : "Bad";
        return (
          <div
            key={d.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${DECISION_STYLE[d.decision]}`}
                  >
                    {DECISION_LABEL[d.decision]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${verdictStyle}`}
                  >
                    {verdictLabel}
                  </span>
                </div>
                <h3 className="mt-2 font-medium text-[var(--color-fg)]">
                  {d.marketQuestion ?? d.marketId}
                </h3>
                <div className="text-xs text-[var(--color-muted)]">
                  {d.walletAddress} · {new Date(d.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--color-muted)]">Sim PnL</div>
                <div className="font-medium tabular-nums">
                  {money(d.outcome.simulatedPnl)}
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
              {SCORE_FIELDS.map((f) => (
                <div key={f.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-muted)]">{f.label}</span>
                    <span className="tabular-nums">{pct(d.score[f.key])}</span>
                  </div>
                  <ScoreBar value={d.score[f.key]} />
                </div>
              ))}
            </div>

            {/* Reasons + Risks */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-medium text-[var(--color-muted)]">
                  Reasons
                </div>
                {d.reasons.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-sm text-[var(--color-fg)]">
                    {d.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-[var(--color-muted)]">—</div>
                )}
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-[var(--color-muted)]">
                  Risks
                </div>
                {d.risks.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-sm text-[var(--color-accent)]">
                    {d.risks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-[var(--color-muted)]">—</div>
                )}
              </div>
            </div>

            {/* What the bot learned */}
            {d.outcome.lessons.length > 0 && (
              <div className="mt-4 rounded-lg bg-[var(--color-bg)]/50 p-3">
                <div className="mb-1 text-xs font-medium text-[var(--color-muted)]">
                  What the bot learned
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-sm text-[var(--color-fg)]">
                  {d.outcome.lessons.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
