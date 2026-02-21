type StatusPillProps = {
  label: string;
  value: number;
  accent: string;
};

export function StatusPill({ label, value, accent }: StatusPillProps) {
  return (
    <div className={`rounded-2xl border border-black/10 ${accent} px-4 py-3`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
