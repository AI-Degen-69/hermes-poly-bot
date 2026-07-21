import { getWalletRankings } from "@/lib/queries/wallets";
import { WalletTable } from "@/components/WalletTable";

export const dynamic = "force-dynamic";

export default async function WalletRankingsPage() {
  const wallets = await getWalletRankings();
  const tracked = wallets.filter((w) => w.status === "track").length;

  return (
    <div className="px-8 py-6">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
            Part 2 · Page 2
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-fg)]">
            Wallet Rankings
          </h1>
        </div>
        <span className="rounded bg-[var(--color-accent)]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Demo data
        </span>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        Top leaderboard scan scored by ROI, consistency, and copyability.
        Penalized wallets where profit came from a single lucky trade.
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-muted)]">
        <span>
          <span className="tabular text-[var(--color-fg)]">{wallets.length}</span>{" "}
          wallets
        </span>
        <span>
          <span className="tabular text-[var(--color-track)]">{tracked}</span> tracked
        </span>
      </div>

      <WalletTable wallets={wallets} />
    </div>
  );
}
