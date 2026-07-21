import type { RulesSummary, RuleChangeRow } from "@/lib/queries/rules";

function fmtRuleKey(k: string): string {
  return k
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());
}

function fmtVal(v: number | string | boolean): string {
  if (typeof v === "boolean") return v ? "on" : "off";
  if (typeof v === "number") return v % 1 === 0 ? String(v) : v.toFixed(3);
  return v;
}

function changedKeys(
  before: Record<string, number | string | boolean> | null,
  after: Record<string, number | string | boolean> | null,
): string[] {
  if (!before || !after) return [];
  return Object.keys(after).filter((k) => before[k] !== after[k]);
}

function ChangeCard({ c }: { c: RuleChangeRow }) {
  const diffs = changedKeys(c.before, c.after);
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[var(--color-accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            v{c.newRuleSetId}
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            by {c.changedBy}
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          {new Date(c.createdAt).toLocaleString()}
        </span>
      </div>

      <p className="mt-2 text-sm text-[var(--color-text)]">{c.reason}</p>

      {diffs.length > 0 && (
        <div className="mt-3 overflow-hidden rounded border border-[var(--color-border)]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 bg-[var(--color-track)]/40 px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]">
            <span>Rule</span>
            <span className="text-right">Before</span>
            <span className="text-right">After</span>
          </div>
          {diffs.map((k) => (
            <div
              key={k}
              className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-1.5 text-sm border-t border-[var(--color-border)]"
            >
              <span className="text-[var(--color-text)]">{fmtRuleKey(k)}</span>
              <span className="text-right text-[var(--color-danger)]">
                {c.before ? fmtVal(c.before[k]) : "—"}
              </span>
              <span className="text-right text-[var(--color-success)]">
                {c.after ? fmtVal(c.after[k]) : "—"}
              </span>
            </div>
          ))}
        </div>
      )}

      {c.evidenceSummary && (
        <div className="mt-3 rounded bg-[var(--color-track)]/30 p-2.5 text-xs text-[var(--color-text-muted)]">
          <span className="font-medium text-[var(--color-text)]">Evidence: </span>
          {c.evidenceSummary}
        </div>
      )}
    </div>
  );
}

export function RulesView({ data }: { data: RulesSummary }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Rules</h1>
        <span className="rounded-full bg-[var(--color-accent)]/15 px-3 py-1 text-sm font-medium text-[var(--color-accent)]">
          Active v{data.activeVersion}
        </span>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium text-[var(--color-text)]">
          Current Scoring Thresholds
        </h2>
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]">
          <div className="grid grid-cols-[1fr_auto] gap-x-4 bg-[var(--color-track)]/40 px-4 py-2 text-xs font-medium text-[var(--color-text-muted)]">
            <span>Rule</span>
            <span className="text-right">Value</span>
          </div>
          {data.activeRules.map((r, i) => (
            <div
              key={r.key}
              className={`grid grid-cols-[1fr_auto] gap-x-4 px-4 py-2 text-sm ${
                i > 0 ? "border-t border-[var(--color-border)]" : ""
              }`}
            >
              <span className="text-[var(--color-text)]">{fmtRuleKey(r.key)}</span>
              <span className="text-right font-medium text-[var(--color-text)]">
                {fmtVal(r.value)}
              </span>
            </div>
          ))}
          {data.activeRules.length === 0 && (
            <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
              No active rules configured.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium text-[var(--color-text)]">
          Automatic Rule Changes
        </h2>
        <div className="space-y-3">
          {data.changes.map((c) => (
            <ChangeCard key={c.id} c={c} />
          ))}
          {data.changes.length === 0 && (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
              No rule changes recorded yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}