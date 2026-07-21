import { getTradeSignals } from "@/lib/queries/signals";
import { TradeSignalsTable } from "@/components/TradeSignalsTable";

export const dynamic = "force-dynamic";

export default async function TradeSignalsPage() {
  const signals = await getTradeSignals();
  const copyCount = signals.filter((s) => s.decision === "paper_copy").length;

  return (
    <div className="px-8 py-6">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
            Part 4 · Page 4
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-fg)]">
            Trade Signals
          </h1>
        </div>
        <span className="rounded bg-[var(--color-accent)]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Demo data
        </span>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        Every scanned wallet trade the bot evaluated — with entry vs. detected price,
        movement since entry, and the copy/watch/skip decision.
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-muted)]">
        <span>
          <span className="tabular text-[var(--color-fg)]">{signals.length}</span> signals
        </span>
        <span>
          <span className="tabular text-[var(--color-track)]">{copyCount}</span> copied
        </span>
      </div>

      <TradeSignalsTable signals={signals} />
    </div>
  );
}
