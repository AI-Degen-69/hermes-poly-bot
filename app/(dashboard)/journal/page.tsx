import { getDecisionJournal } from "@/lib/queries/journal";
import { JournalView } from "@/components/JournalView";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const decisions = await getDecisionJournal();
  const good = decisions.filter((d) => d.outcome.wasDecisionGood === true).length;
  const bad = decisions.filter((d) => d.outcome.wasDecisionGood === false).length;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-fg)]">
            Decision Journal
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Every copy / watchlist / skip decision with its score breakdown and
            later judgment.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-[var(--color-track)]/10 px-3 py-1 font-medium text-[var(--color-track)]">
            {good} Good
          </span>
          <span className="rounded-full bg-[var(--color-accent)]/10 px-3 py-1 font-medium text-[var(--color-accent)]">
            {bad} Bad
          </span>
        </div>
      </header>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)]/5 px-4 py-2 text-xs text-[var(--color-accent)]">
        DEMO data — generated for wiring verification only.
      </div>

      <JournalView rows={decisions} />
    </main>
  );
}
