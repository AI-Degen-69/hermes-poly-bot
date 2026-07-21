import type { RankedWallet } from "@/lib/queries/wallets";

const STATUS_STYLE: Record<RankedWallet["status"], string> = {
  track: "bg-[var(--color-track)]/10 text-[var(--color-track)]",
  watch: "bg-[var(--color-watch)]/10 text-[var(--color-watch)]",
  ignore: "bg-[var(--color-ignore)]/10 text-[var(--color-ignore)]",
};

const STATUS_LABEL: Record<RankedWallet["status"], string> = {
  track: "Track",
  watch: "Watch",
  ignore: "Ignore",
};

function ScoreBar({ value }: { value: number | null }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value * 100));
  return (
    <div className="grid grid-cols-[64px_2.5rem] items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-accent)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="tabular text-right text-xs text-[var(--color-muted)]">
        {value === null ? "—" : `${(value * 100).toFixed(0)}`}
      </span>
    </div>
  );
}

function RoiCell({ value }: { value: number | null }) {
  const pctStr = value === null ? "—" : `${(value * 100).toFixed(0)}%`;
  return (
    <div className="grid grid-cols-[64px_2.5rem] items-center gap-2">
      <span className="tabular text-right text-[var(--color-fg)]">{pctStr}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-accent)]"
          style={{ width: `${value === null ? 0 : Math.max(0, Math.min(100, value * 100))}%` }}
        />
      </div>
    </div>
  );
}

export function WalletTable({ wallets }: { wallets: RankedWallet[] }) {
  if (wallets.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-muted)]">
        No wallets scanned yet. Run <code className="tabular">npm run scan:wallets</code> to
        populate the leaderboard.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Wallet</th>
            <th className="px-4 py-3 font-medium text-right">Global</th>
            <th className="px-4 py-3 font-medium text-right">ROI 30d</th>
            <th className="px-4 py-3 font-medium text-right">Cons.</th>
            <th className="px-4 py-3 font-medium text-right">Copyable</th>
            <th className="px-4 py-3 font-medium text-right">1-Hit Pen.</th>
            <th className="px-4 py-3 font-medium">Best Cat.</th>
            <th className="px-4 py-3 font-medium text-right">Paper PnL</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((w) => (
            <tr
              key={w.address}
              className="border-b border-[var(--color-border)]/60 last:border-0 hover:bg-[var(--color-surface)]"
            >
              <td className="px-4 py-3">
                <span className="rank-marker">{String(w.rank).padStart(2, "0")}</span>
              </td>
              <td className="px-4 py-3">
                <a
                  href={`/wallet-profile?address=${encodeURIComponent(w.address)}`}
                  className="block"
                >
                  <div className="font-medium text-[var(--color-fg)] hover:text-[var(--color-accent)]">
                    {w.label ?? "—"}
                  </div>
                  <div className="tabular text-xs text-[var(--color-muted)]">
                    {w.address}
                  </div>
                </a>
              </td>
              <td className="px-4 py-3 text-right">
                <ScoreBar value={w.globalScore} />
              </td>
              <td className="px-4 py-3 text-right">
                <RoiCell value={w.roi30d} />
              </td>
              <td className="px-4 py-3 text-right">
                <ScoreBar value={w.consistencyScore} />
              </td>
              <td className="px-4 py-3 text-right">
                <ScoreBar value={w.copyabilityScore} />
              </td>
              <td className="tabular px-4 py-3 text-right text-[var(--color-neg)]">
                {w.oneHitWonderPenalty === null
                  ? "—"
                  : `${(w.oneHitWonderPenalty * 100).toFixed(0)}%`}
              </td>
              <td className="px-4 py-3 text-[var(--color-muted)]">
                {w.bestCategory ?? "—"}
              </td>
              <td
                className={`tabular px-4 py-3 text-right ${
                  w.paperPnl > 0
                    ? "text-[var(--color-pos)]"
                    : w.paperPnl < 0
                      ? "text-[var(--color-neg)]"
                      : "text-[var(--color-muted)]"
                }`}
              >
                ${w.paperPnl.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[w.status]}`}
                >
                  {STATUS_LABEL[w.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
