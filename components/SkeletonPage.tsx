export interface SkeletonPageProps {
  part: string;
  title: string;
  description: string;
  sections: string[];
}

export function SkeletonPage({
  part,
  title,
  description,
  sections,
}: SkeletonPageProps) {
  return (
    <div className="px-8 py-6">
      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-400">
        {part}
      </div>
      <h1 className="text-2xl font-semibold text-zinc-100">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">{description}</p>
      <div className="mt-6 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40 p-5">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Skeleton — planned sections
        </div>
        <ul className="mt-3 space-y-2">
          {sections.map((s) => (
            <li
              key={s}
              className="flex items-start gap-2 text-sm text-zinc-300"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
              {s}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-xs text-zinc-600">
        Placeholder only — real data wiring lands in the per-part build step.
      </p>
    </div>
  );
}
