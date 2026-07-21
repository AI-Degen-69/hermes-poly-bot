import type { WalletProfileData, ProfileTrade } from "@/lib/queries/wallet-profile";

const STATUS_STYLE: Record<WalletProfileData["status"], string> = {
  track: "bg-[var(--color-track)]/10 text-[var(--color-track)]",
  watch: "bg-[var(--color-watch)]/10 text-[var(--color-watch)]",
  ignore: "bg-[var(--color-ignore)]/10 text-[var(--color-ignore)]",
};
const STATUS_LABEL: Record<WalletProfileData["status"], string> = {
  track: "Track",
  watch: "Watch",
  ignore: "Ignore",
};

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
        {label}
      </div>
      <div className="tabular mt-1 text-xl font-semibold text-[var(--color-fg)]">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-[var(--color-muted)]">{hint}</div>
      ) : null}
    </div>
  );
}

function pct(v: number | null): string {
  return v === null ? "—" : `${(v * 100).toFixed(0)}%`;
}
function num(v: number | null, digits = 2): string {
  return v === null ? "—" : v.toFixed(digits);
}

function fmtTime(ts: number | null): string {
  if (ts === null) return "—";
  return new Date(ts).toISOString().slice(0, 16).replace("T", " ");
}

export function WalletProfileView({ w }: { w: WalletProfileData }) {
  const verdict: string[] = [];
  if (w.copyable) verdict.push("copyable");
  else verdict.push("not copyable");
  if (w.oneHitWonderPenalty !== null && w.oneHitWonderPenalty > 0.5)
    verdict.push("one-hit-wonder risk");
  if (w.averageLiquidity !== null && w.averageLiquidity < 5000)
    verdict.push("illiquid");
  if (w.averageSpread !== null && w.averageSpread > 0.05)
    verdict.push("wide spread");
  if (w.bestCategory) verdict.push(`best: ${w.bestCategory}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-fg)]">
          {w.label ?? w.address}
        </h2>
        <span
          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[w.status]}`}
        >
          {STATUS_LABEL[w.status]}
        </span>
      </div>
      <div className="tabular text-xs text-[var(--color-muted)]">{w.address}</div>

      {verdict.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {verdict.map((v) => (
            <span
              key={v}
              className="rounded bg-[var(--color-accent)]/10 px-2 py-1 text-xs text-[var(--color-accent)]"
            >
              {v}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="ROI 30d" value={pct(w.roi30d)} />
        <Stat label="Trades (30d)" value={String(w.tradeCount30d ?? "—")} />
        <Stat
          label="Win rate (resolved)"
          value={pct(w.winRate30d)}
          hint={`${w.resolvedTradeCount30d ?? 0} resolved`}
        />
        <Stat label="Avg trade size" value={`$${num(w.averageTradeSize)}`} />
        <Stat label="Avg liquidity" value={num(w.averageLiquidity, 0)} />
        <Stat label="Avg spread" value={pct(w.averageSpread)} />
        <Stat label="Avg entry timing" value={num(w.averageEntryTiming)} />
        <Stat
          label="Paper PnL"
          value={`$${w.paperPnl.toFixed(2)}`}
          hint={`${w.paperOpenPositions} open`}
        />
      </div>

      {w.categoryStrengths && Object.keys(w.categoryStrengths).length > 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 text-xs uppercase tracking-wider text-[var(--color-muted)]">
            Category strengths
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(w.categoryStrengths)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, score]) => (
                <span
                  key={cat}
                  className="tabular rounded bg-[var(--color-surface-2)] px-2 py-1 text-xs text-[var(--color-fg)]"
                >
                  {cat} · {(score * 100).toFixed(0)}
                </span>
              ))}
          </div>
        </div>
      ) : null}

      {(w.copyabilityNotes || w.riskNotes) && (
        <div className="grid gap-3 md:grid-cols-2">
          {w.copyabilityNotes ? (
            <div className="rounded-lg border border-[var(--color-border)] p-4">
              <div className="mb-1 text-xs uppercase tracking-wider text-[var(--color-muted)]">
                Copyability
              </div>
              <p className="text-sm text-[var(--color-fg)]">{w.copyabilityNotes}</p>
            </div>
          ) : null}
          {w.riskNotes ? (
            <div className="rounded-lg border border-[var(--color-border)] p-4">
              <div className="mb-1 text-xs uppercase tracking-wider text-[var(--color-neg)]">
                Risk notes
              </div>
              <p className="text-sm text-[var(--color-fg)]">{w.riskNotes}</p>
            </div>
          ) : null}
        </div>
      )}

      <div className="rounded-lg border border-[var(--color-border)]">
        <div className="border-b border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-fg)]">
          Recent trades ({w.recentTrades.length})
        </div>
        {w.recentTrades.length === 0 ? (
          <div className="px-4 py-6 text-sm text-[var(--color-muted)]">
            No observed trades recorded for this wallet.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]/60">
            {w.recentTrades.map((t: ProfileTrade) => (
              <li key={t.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--color-fg)]">
                    {t.marketQuestion ?? t.marketCategory ?? `trade #${t.id}`}
                  </span>
                  <span className="tabular text-xs text-[var(--color-muted)]">
                    {fmtTime(t.timestamp)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {t.outcome ? (
                    <span className="rounded bg-[var(--color-surface-2)] px-2 py-0.5 text-[var(--color-fg)]">
                      {t.outcome}
                    </span>
                  ) : null}
                  {t.side ? (
                    <span className="rounded bg-[var(--color-surface-2)] px-2 py-0.5 text-[var(--color-fg)]">
                      {t.side}
                    </span>
                  ) : null}
                  {t.size !== null ? (
                    <span className="tabular rounded bg-[var(--color-surface-2)] px-2 py-0.5 text-[var(--color-fg)]">
                      ${t.size.toFixed(2)}
                    </span>
                  ) : null}
                  {t.marketCategory ? (
                    <span className="rounded bg-[var(--color-accent)]/10 px-2 py-0.5 text-[var(--color-accent)]">
                      {t.marketCategory}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
