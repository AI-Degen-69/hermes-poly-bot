import type { TradeSignal } from "@/lib/queries/signals";

const DECISION_STYLE: Record<TradeSignal["decision"], string> = {
  paper_copy: "bg-[var(--color-track)]/10 text-[var(--color-track)]",
  watchlist: "bg-[var(--color-watch)]/10 text-[var(--color-watch)]",
  skip: "bg-[var(--color-ignore)]/10 text-[var(--color-ignore)]",
};
const DECISION_LABEL: Record<TradeSignal["decision"], string> = {
  paper_copy: "Copy",
  watchlist: "Watch",
  skip: "Skip",
};

function fmtPrice(v: number | null): string {
  return v === null ? "—" : `$${v.toFixed(2)}`;
}
function fmtTime(ts: number | null): string {
  if (ts === null) return "—";
  return new Date(ts).toISOString().slice(0, 16).replace("T", " ");
}
function pct(v: number | null): string {
  return v === null ? "—" : `${(v * 100).toFixed(0)}%`;
}

export function TradeSignalsTable({ signals }: { signals: TradeSignal[] }) {
  if (signals.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-muted)]">
        No signals generated yet. Run <code className="tabular">npm run scan:wallets</code> to
        populate the decision journal.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {signals.map((s) => (
        <div
          key={s.id}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-[var(--color-fg)]">
                {s.marketQuestion ?? s.marketId}
              </div>
              <div className="tabular mt-1 text-xs text-[var(--color-muted)]">
                {s.walletAddress}
                {s.marketCategory ? ` · ${s.marketCategory}` : ""}
                {s.outcome ? ` · ${s.outcome}` : ""}
                {s.side ? ` · ${s.side}` : ""}
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 rounded px-2 py-0.5 text-xs font-medium ${DECISION_STYLE[s.decision]}`}
            >
              {DECISION_LABEL[s.decision]}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:grid-cols-4">
            <div>
              <div className="text-[var(--color-muted)]">Entry</div>
              <div className="tabular text-[var(--color-fg)]">{fmtPrice(s.walletEntryPrice)}</div>
            </div>
            <div>
              <div className="text-[var(--color-muted)]">Detected</div>
              <div className="tabular text-[var(--color-fg)]">{fmtPrice(s.detectedPrice)}</div>
            </div>
            <div>
              <div className="text-[var(--color-muted)]">Move since entry</div>
              <div
                className={`tabular ${s.movement !== null && s.movement >= 0 ? "text-[var(--color-pos)]" : "text-[var(--color-neg)]"}`}
              >
                {s.movement === null ? "—" : `${(s.movement * 100).toFixed(1)}%`}
              </div>
            </div>
            <div>
              <div className="text-[var(--color-muted)]">Size</div>
              <div className="tabular text-[var(--color-fg)]">
                {s.size === null ? "—" : `$${s.size.toFixed(2)}`}
              </div>
            </div>
            <div>
              <div className="text-[var(--color-muted)]">Score</div>
              <div className="tabular text-[var(--color-fg)]">{pct(s.score)}</div>
            </div>
            <div>
              <div className="text-[var(--color-muted)]">Confidence</div>
              <div className="tabular text-[var(--color-fg)]">{pct(s.confidence)}</div>
            </div>
            <div>
              <div className="text-[var(--color-muted)]">Created</div>
              <div className="tabular text-[var(--color-fg)]">{fmtTime(s.createdAt)}</div>
            </div>
          </div>

          {s.reasons.length > 0 || s.risks.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {s.reasons.map((r) => (
                <span
                  key={`r-${r}`}
                  className="rounded bg-[var(--color-track)]/10 px-2 py-0.5 text-[var(--color-track)]"
                >
                  {r}
                </span>
              ))}
              {s.risks.map((r) => (
                <span
                  key={`k-${r}`}
                  className="rounded bg-[var(--color-neg)]/10 px-2 py-0.5 text-[var(--color-neg)]"
                >
                  {r}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
