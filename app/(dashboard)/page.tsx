import { getOverviewMetrics, getPnlSeries } from "@/lib/queries/overview";
import { MetricCard } from "@/components/MetricCard";
import { PnlChart } from "@/components/PnlChart";

export const dynamic = "force-dynamic";

const fmtUsd = (n: number) => `$${n.toFixed(2)}`;
const fmtPct = (n: number | null) => (n === null ? "—" : `${(n * 100).toFixed(0)}%`);

const reportStatusLabel: Record<string, string> = {
  sent: "Sent",
  pending: "Pending",
  none: "Not generated",
};

export default async function OverviewPage() {
  const [m, series] = await Promise.all([getOverviewMetrics(), getPnlSeries()]);
  const pnlClass = m.totalPaperPnl >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="px-8 py-6">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-emerald-400">
            Part 2 · Page 1
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100">Overview</h1>
        </div>
        <span className="rounded bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
          Demo data
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label="Paper PnL"
          value={<span className={pnlClass}>{fmtUsd(m.totalPaperPnl)}</span>}
        />
        <MetricCard label="Win rate" value={fmtPct(m.winRate)} />
        <MetricCard
          label="Open positions"
          value={String(m.openPaperPositions)}
        />
        <MetricCard
          label="Tracked wallets"
          value={String(m.activeTrackedWallets)}
        />
        <MetricCard
          label="Copy candidates today"
          value={String(m.copyCandidatesToday)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 lg:col-span-2">
          <div className="text-sm font-medium text-zinc-300">
            Paper PnL over time
          </div>
          <div className="mt-3">
            <PnlChart points={series} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              End-of-day report
            </div>
            <div className="mt-1 text-lg font-semibold text-zinc-100">
              {reportStatusLabel[m.endOfDayReportStatus]}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Latest rules
            </div>
            <div className="mt-1 text-lg font-semibold text-zinc-100">
              v{m.latestRuleVersion ?? "—"}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {m.ruleChangeCount} automatic change
              {m.ruleChangeCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
