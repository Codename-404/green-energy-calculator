"use client";

interface Props {
  coverage: number; // 0-1 (or > 1 for surplus)
}

export function CoverageBar({ coverage }: Props) {
  const pct = Math.min(1, Math.max(0, coverage)) * 100;
  const surplus = coverage > 1 ? Math.round((coverage - 1) * 100) : 0;
  const pctLabel = Math.round(coverage * 100);

  const color =
    coverage >= 1
      ? "bg-emerald-500"
      : coverage >= 0.8
        ? "bg-amber-500"
        : "bg-destructive";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Demand coverage</span>
        <span className="font-semibold tabular-nums">
          {pctLabel}%
          {surplus > 0 && (
            <span className="ml-1 text-emerald-600">(+{surplus}% surplus)</span>
          )}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
