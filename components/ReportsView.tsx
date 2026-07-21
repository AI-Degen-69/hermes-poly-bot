import type { ReportsSummary, DailyReportRow } from "@/lib/queries/reports";

function money(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  const sign = n >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
      <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function WalletList({ title, wallets, tone }: { title: string; wallets: { address: string; label: string | null; pnl: number }[]; tone: "good" | "bad" }) {
  const color = tone === "good" ? "var(--color-success)" : "var(--color-danger)";
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <h3 className="text-sm font-medium text-[var(--color-text-muted)]">{title}</h3>
      <div className="mt-2 space-y-1.5">
        {wallets.length === 0 && (
          <div className="text-sm text-[var(--color-text-muted)]">—</div>
        )}
        {wallets.map((w) => (
          <div key={w.address} className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-text)]">
              {w.label ?? w.address}{" "}
              <span className="text-[var(--color-text-muted)]">{w.address}</span>
            </span>
            <span className="font-medium" style={{ color }}>
              {money(w.pnl)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayReport({ r }: { r: DailyReportRow }) {
  const wr = r.winRate !== null && r.winRate !== undefined ? `${Math.round(r.winRate * 100)}%` : "—";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Paper PnL" value={money(r.paperPnl)} />
        <Stat label="Win Rate" value={wr} />
        <Stat label="Open Positions" value={r.openPositions ?? "—"} />
        <Stat label="New Signals" value={r.newSignals ?? "—"} />
        <Stat label="Copied" value={r.copiedSignals ?? "—"} />
        <Stat label="Watched" value={r.watchedSignals ?? "—"} />
        <Stat label="Skipped" value={r.skippedSignals ?? "—"} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <WalletList title="Best Wallets Today" wallets={r.bestWallets} tone="good" />
        <WalletList title="Worst Wallets Today" wallets={r.worstWallets} tone="bad" />
      </div>

      {r.ruleUpdates.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
            Important Rule Updates
          </h3>
          <div className="mt-2 space-y-2">
            {r.ruleUpdates.map((u, i) => (
              <div
                key={i}
                className="rounded border border-[var(--color-border)] bg-[var(--color-track)]/30 p-2.5 text-sm text-[var(--color-text)]"
              >
                <span className="font-medium text-[var(--color-accent)]">
                  v{u.version}{" "}
                </span>
                {u.reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {r.summary && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-track)]/20 p-4 text-sm text-[var(--color-text)]">
          <span className="font-medium">Performance summary: </span>
          {r.summary}
        </div>
      )}
    </div>
  );
}

export function ReportsView({ data }: { data: ReportsSummary }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Reports</h1>
        <span className="rounded-full bg-[var(--color-accent)]/15 px-3 py-1 text-sm font-medium text-[var(--color-accent)]">
          Active v{data.activeVersion}
        </span>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium text-[var(--color-text)]">
          End-of-Day Report
        </h2>
        {data.latest ? (
          <DayReport r={data.latest} />
        ) : (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
            No report available yet.
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-[var(--color-text)]">
          What Hermes Changed &amp; Why
        </h2>
        <div className="space-y-3">
          {data.recentRuleChanges.length === 0 && (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
              No rule changes recorded yet.
            </div>
          )}
          {data.recentRuleChanges.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-4"
            >
              <p className="text-sm text-[var(--color-text)]">{c.reason}</p>
              {c.evidenceSummary && (
                <div className="mt-2 rounded bg-[var(--color-track)]/30 p-2.5 text-xs text-[var(--color-text-muted)]">
                  <span className="font-medium text-[var(--color-text)]">
                    Evidence:{" "}
                  </span>
                  {c.evidenceSummary}
                </div>
              )}
              <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-[var(--color-text)]">
          Weekly Report
        </h2>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
          {data.latest
            ? `Week-to-date (single snapshot ${data.latest.date}): Paper PnL ${money(
                data.latest.paperPnl,
              )}, win rate ${data.latest.winRate !== null ? `${Math.round(data.latest.winRate * 100)}%` : "—"}. Full weekly roll-up accumulates once more daily reports are generated.`
            : "No data yet."}
        </div>
      </section>
    </div>
  );
}