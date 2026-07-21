import { getReports } from "@/lib/queries/reports";
import { ReportsView } from "@/components/ReportsView";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const data = await getReports();

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)]/5 px-4 py-2 text-xs text-[var(--color-accent)]">
        DEMO data — generated for wiring verification only.
      </div>

      <ReportsView data={data} />
    </main>
  );
}