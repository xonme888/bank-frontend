// Channel-scoped daily limit gauge — single bar.
// One row per channel; component stays primitive so screens can compose layouts.
type Props = {
  pct: number;
  label: string;
  exempt?: boolean;
  threshold?: number;       // % at which color shifts to warning
};

export function GaugeRow({ pct, label, exempt = false, threshold = 80 }: Props) {
  const color = exempt
    ? "var(--ink-3)"
    : pct >= 100 ? "var(--tx-withdraw)"
    : pct >= threshold ? "var(--st-edd-pending)"
    : "var(--accent)";

  return (
    <div className="mb-3.5">
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[11px] text-ink-2">{label}</span>
        <span className="font-mono tnum text-[11px]" style={{ color }}>
          {exempt ? "— 면제" : `${pct}%`}
        </span>
      </div>
      <div className="h-2 bg-rule relative">
        {!exempt ? (
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${Math.min(100, pct)}%`, background: color }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(45deg, var(--rule), var(--rule) 4px, transparent 4px, transparent 8px)",
            }}
          />
        )}
      </div>
    </div>
  );
}
