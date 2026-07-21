import type { PaperTradeRow } from "@/lib/queries/paper-trades";

const STATUS_STYLE: Record<PaperTradeRow["status"], string> = {
  open: "bg-[var(--color-track)]/10 text-[var(--color-track)]",
  closed: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
  resolved: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
};

const STATUS_LABEL: Record<PaperTradeRow["status"], string> = {
  open: "Open",
  closed: "Closed",
  resolved: "Resolved",
};

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function PaperTradesTable({ rows }: { rows: PaperTradeRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center text-[var(--color-muted)] text-sm">
        No paper trades yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted)]">
            <th className="px-4 py-3 font-medium">Market</th>
            <th className="px-4 py-3 font-medium text-right">Size</th>
            <th className="px-4 py-3 font-medium text-right">Entry</th>
            <th className="px-4 py-3 font-medium text-right">Current</th>
            <th className="px-4 py-3 font-medium text-right">1h PnL</th>
            <th className="px-4 py-3 font-medium text-right">Final PnL</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Side</th>
            <th className="px-4 py-3 font-medium">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const finalPnl =
              t.status === "open"
                ? t.unrealizedPnl
                : (t.realizedPnl ?? t.unrealizedPnl);
            const finalLabel = t.status === "open" ? "Live" : "Final";
            return (
              <tr
                key={t.id}
                className="border-b border-[var(--color-border)]/60 hover:bg-[var(--color-card)]/50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--color-fg)]">
                    {t.marketQuestion ?? t.marketId}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">
                    {t.walletAddress}
                    {t.outcome ? ` · ${t.outcome.toUpperCase()}` : ""}
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {money(t.positionSize)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {pct(t.entryPrice)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {pct(t.currentPrice)}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums ${
                    t.hourlyPnl === null
                      ? "text-[var(--color-muted)]"
                      : t.hourlyPnl >= 0
                        ? "text-[var(--color-track)]"
                        : "text-[var(--color-accent)]"
                  }`}
                >
                  {t.hourlyPnl === null ? "—" : money(t.hourlyPnl)}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums font-medium ${
                    finalPnl === null
                      ? "text-[var(--color-muted)]"
                      : finalPnl >= 0
                        ? "text-[var(--color-track)]"
                        : "text-[var(--color-accent)]"
                  }`}
                >
                  {finalPnl === null ? (
                    "—"
                  ) : (
                    <>
                      {money(finalPnl)}
                      <span className="ml-1 text-xs text-[var(--color-muted)]">
                        {finalLabel}
                      </span>
                    </>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[t.status]}`}
                  >
                    {STATUS_LABEL[t.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">
                  {t.side ? t.side.toUpperCase() : "—"}
                </td>
                <td className="px-4 py-3 max-w-[220px]">
                  {t.reasons.length > 0 ? (
                    <ul className="list-disc list-inside text-xs text-[var(--color-muted)] space-y-0.5">
                      {t.reasons.map((r, i) => (
                        <li key={i} className="truncate" title={r}>
                          {r}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[var(--color-muted)]">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
