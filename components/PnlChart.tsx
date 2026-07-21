interface PnlPoint {
  t: number;
  pnl: number;
}

export function PnlChart({
  points,
  height = 180,
}: {
  points: PnlPoint[];
  height?: number;
}) {
  const width = 640;
  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-zinc-700 text-sm text-zinc-500">
        No PnL history yet
      </div>
    );
  }

  const padX = 12;
  const padY = 16;
  const pnls = points.map((p) => p.pnl);
  const min = Math.min(0, ...pnls);
  const max = Math.max(0, ...pnls);
  const range = max - min || 1;
  const n = points.length;

  const x = (i: number) => padX + (i / (n - 1)) * (width - padX * 2);
  const y = (v: number) => height - padY - ((v - min) / range) * (height - padY * 2);

  const linePts = points
    .map((p, i) => `${x(i).toFixed(1)},${y(p.pnl).toFixed(1)}`)
    .join(" ");

  const areaPath = `M ${x(0).toFixed(1)},${y(min).toFixed(1)} L ${points
    .map((p, i) => `${x(i).toFixed(1)},${y(p.pnl).toFixed(1)}`)
    .join(" L ")} L ${x(n - 1).toFixed(1)},${y(min).toFixed(1)} Z`;

  const zeroY = y(0);
  const last = pnls[n - 1];
  const stroke = last >= 0 ? "#34d399" : "#f87171";
  const gradId = "pnlGrad";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Paper PnL over time"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1={padX}
        y1={zeroY}
        x2={width - padX}
        y2={zeroY}
        stroke="#3f3f46"
        strokeDasharray="3 3"
      />
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline
        points={linePts}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
