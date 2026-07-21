import { getPerformance } from "@/lib/queries/performance";
import { PerformanceView } from "@/components/PerformanceView";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const data = await getPerformance();

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-100">Performance</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tracks whether the bot-filtered strategy beats blindly copying
          leaderboard wallets.
        </p>
        <div className="mt-2 rounded-lg border border-amber-800/40 bg-amber-950/20 px-4 py-2 text-xs text-amber-400">
          DEMO data — generated for wiring verification only.
        </div>
      </header>

      <PerformanceView data={data} />
    </main>
  );
}
