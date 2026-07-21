import { getPaperTrades } from "@/lib/queries/paper-trades";
import { PaperTradesTable } from "@/components/PaperTradesTable";

export const dynamic = "force-dynamic";

export default async function PaperTradesPage() {
  const trades = await getPaperTrades();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-fg)]">
          Paper Trades
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Simulated positions copied from tracked wallets. Position size
          capped at $5–$20.{" "}
          <span className="rounded bg-[var(--color-accent)]/10 px-1.5 py-0.5 text-xs text-[var(--color-accent)]">
            DEMO data
          </span>
        </p>
      </header>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
        <PaperTradesTable rows={trades} />
      </section>
    </main>
  );
}
