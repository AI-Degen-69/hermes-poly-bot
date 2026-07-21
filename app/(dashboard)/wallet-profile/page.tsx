import { getWalletProfile, getTrackedAddresses } from "@/lib/queries/wallet-profile";
import { WalletProfileView } from "@/components/WalletProfileView";

export const dynamic = "force-dynamic";

export default async function WalletProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ address?: string }>;
}) {
  const { address } = await searchParams;
  const tracked = await getTrackedAddresses();

  if (!address) {
    return (
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold text-[var(--color-fg)]">
          Wallet Profile
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Select a tracked wallet to inspect its full scoring breakdown.
        </p>
        {tracked.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-muted)]">
            No tracked wallets yet. Run <code className="tabular">npm run scan:wallets</code> to
            populate the leaderboard.
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {tracked.map((a) => (
              <li key={a}>
                <a
                  href={`/wallet-profile?address=${encodeURIComponent(a)}`}
                  className="tabular block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
                >
                  {a}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const profile = await getWalletProfile(address);

  if (!profile) {
    return (
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold text-[var(--color-fg)]">
          Wallet not found
        </h1>
        <p className="tabular mt-2 text-sm text-[var(--color-muted)]">{address}</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          This address is not in the scanned leaderboard. Try a tracked wallet from the
          list.
        </p>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
            Part 3 · Page 3
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-fg)]">
            Wallet Profile
          </h1>
        </div>
        <span className="rounded bg-[var(--color-accent)]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Demo data
        </span>
      </div>

      <WalletProfileView w={profile} />
    </div>
  );
}
