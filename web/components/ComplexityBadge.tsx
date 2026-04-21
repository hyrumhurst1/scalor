interface Props {
  label: string;
  value: string;
  tone?: "time" | "space";
}

export function ComplexityBadge({ label, value, tone = "time" }: Props) {
  const accent =
    tone === "time"
      ? "border-emerald-500/40 text-emerald-300"
      : "border-sky-500/40 text-sky-300";
  return (
    <div
      className={`rounded-lg border ${accent} bg-panel px-4 py-3 shadow-sm`}
    >
      <div className="text-[11px] uppercase tracking-wider text-zinc-400">
        {label}
      </div>
      <div className="mt-1 font-mono text-xl font-semibold">{value}</div>
    </div>
  );
}
