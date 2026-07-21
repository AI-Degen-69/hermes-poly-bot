import type { PerformanceSummary } from "@/lib/queries/performance";
import { PnlChart } from "@/components/PnlChart";
import { MetricCard } from "@/components/MetricCard";

function pct(n: number | null): string {
  return n === null ? "—" : `${(n * 100).toFixed(0)}%`;
}
function money(n: number): string {
  return `$${n.toFixed(2)}`;
}
function pnlColor(n: number): string {
  return n >= 0 ? "text-emerald-400" : "text-red-400";
}

export function PerformanceView({ data }: { data: PerformanceSummary }) {
  const { strategy } = data;
  const botWinRate =
    strategy.botFiltered.copies > 0
      ? strategy.botFiltered.wins / strategy.botFiltered.copies
      : null;
  const blindWinRate =
    strategy.blindCopy.copies > 0
      ? strategy.blindCopy.wins / strategy.blindCopy.copies
      : null;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="Total PnL"
          value={<span className={pnlColor(data.totalPnl)}>{money(data.totalPnl)}</span>}
        />
        <MetricCard label="Win Rate" value={pct(data.winRate)} sub="judged decisions" />
        <MetricCard label="Open" value={data.openPositions} sub="positions" />
        <MetricCard label="Resolved" value={data.resolvedTrades} sub="trades" />
        <MetricCard
          label="Missed Winners"
          value={data.missedWinners}
          sub="skipped & profitable"
        />
        <MetricCard
          label="Avoided Losers"
          value={data.avoidedLosers}
          sub="skipped & lost"
        />
      </div>

      {/* PnL chart */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-sm font-medium text-zinc-300">PnL Curve</h2>
        <PnlChart points={data.pnlCurve} />
        <div className="mt-1 text-xs text-zinc-500">
          Hourly paper PnL snapshots, summed across open positions.
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category performance */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">
            Category Performance
          </h2>
          {data.categoryPerf.length === 0 ? (
            <div className="text-sm text-zinc-500">No category data yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-500">
                  <th className="py-2 font-medium">Category</th>
                  <th className="py-2 text-right font-medium">Trades</th>
                  <th className="py-2 text-right font-medium">PnL</th>
                  <th className="py-2 text-right font-medium">Win%</th>
                </tr>
              </thead>
              <tbody>
                {data.categoryPerf.map((c) => (
                  <tr key={c.category} className="border-b border-zinc-800/50">
                    <td className="py-2 capitalize text-zinc-200">{c.category}</td>
                    <td className="py-2 text-right tabular-nums text-zinc-400">
                      {c.trades}
                    </td>
                    <td className={`py-2 text-right tabular-nums ${pnlColor(c.pnl)}`}>
                      {money(c.pnl)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-zinc-400">
                      {pct(c.winRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Wallet performance */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">
            Wallet Performance
          </h2>
          {data.walletPerf.length === 0 ? (
            <div className="text-sm text-zinc-500">No wallet data yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-500">
                  <th className="py-2 font-medium">Wallet</th>
                  <th className="py-2 text-right font-medium">Trades</th>
                  <th className="py-2 text-right font-medium">PnL</th>
                  <th className="py-2 text-right font-medium">Win%</th>
                </tr>
              </thead>
              <tbody>
                {data.walletPerf.map((w) => (
                  <tr key={w.wallet} className="border-b border-zinc-800/50">
                    <td className="py-2 truncate text-zinc-200 max-w-[140px]">
                      {w.wallet}
                    </td>
                    <td className="py-2 text-right tabular-nums text-zinc-400">
                      {w.trades}
                    </td>
                    <td className={`py-2 text-right tabular-nums ${pnlColor(w.pnl)}`}>
                      {money(w.pnl)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-zinc-400">
                      {pct(w.winRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* Strategy compare */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-sm font-medium text-zinc-300">
          Bot-Filtered vs Blind Leaderboard Copy
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 p-3">
            <div className="text-xs font-medium uppercase tracking-wider text-emerald-400">
              Bot-filtered (copy score ≥ 0.7)
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <div>
                <div className="text-zinc-500">Copies</div>
                <div className="text-lg font-semibold text-zinc-100">
                  {strategy.botFiltered.copies}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">Win%</div>
                <div className="text-lg font-semibold text-zinc-100">
                  {pct(botWinRate)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">PnL</div>
                <div className={`text-lg font-semibold ${pnlColor(strategy.botFiltered.pnl)}`}>
                  {money(strategy.botFiltered.pnl)}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/40 p-3">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Blind copy (all leaderboard)
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <div>
                <div className="text-zinc-500">Copies</div>
                <div className="text-lg font-semibold text-zinc-100">
                  {strategy.blindCopy.copies}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">Win%</div>
                <div className="text-lg font-semibold text-zinc-100">
                  {pct(blindWinRate)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">PnL</div>
                <div className={`text-lg font-semibold ${pnlColor(strategy.blindCopy.pnl)}`}>
                  {money(strategy.blindCopy.pnl)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
