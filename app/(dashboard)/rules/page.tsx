import { getRules } from "@/lib/queries/rules";
import { RulesView } from "@/components/RulesView";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const data = await getRules();

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)]/5 px-4 py-2 text-xs text-[var(--color-accent)]">
        DEMO data — generated for wiring verification only.
      </div>

      <RulesView data={data} />
    </main>
  );
}