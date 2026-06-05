const accents = {
  teal: { icon: 'bg-neutral-50 border-neutral-200 text-neutral-800', stripe: 'stat-stripe-teal' },
  coral: { icon: 'bg-neutral-50 border-neutral-200 text-neutral-800', stripe: 'stat-stripe-coral' },
  amber: { icon: 'bg-neutral-50 border-neutral-200 text-neutral-800', stripe: 'stat-stripe-amber' },
  violet: { icon: 'bg-neutral-50 border-neutral-200 text-neutral-800', stripe: 'stat-stripe-violet' },
  ink: { icon: 'bg-neutral-50 border-neutral-200 text-neutral-800', stripe: 'stat-stripe-ink' },
};

export default function StatCard({ label, value, hint, icon: Icon, accent = 'teal' }) {
  const { icon: iconClass, stripe } = accents[accent] || accents.teal;
  return (
    <div className="panel relative min-h-[118px] overflow-hidden transition-all duration-300 hover:border-neutral-400 hover:translate-y-[-2px]">
      <div className={`stat-stripe ${stripe}`} />
      <div className="flex h-full items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 font-display">{label}</p>
          <p className="mt-2 text-3xl font-black leading-none text-neutral-900 font-display">{value}</p>
          {hint ? <p className="mt-1 text-[10px] text-neutral-400 font-mono font-medium uppercase tracking-tight">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
