const accents = {
  teal: { icon: 'bg-teal/15 text-teal', stripe: 'stat-stripe-teal' },
  coral: { icon: 'bg-coral/15 text-coral', stripe: 'stat-stripe-coral' },
  amber: { icon: 'bg-amber/15 text-amber', stripe: 'stat-stripe-amber' },
  violet: { icon: 'bg-violet-100 text-violet-600', stripe: 'stat-stripe-violet' },
  ink: { icon: 'bg-violet-100 text-violet-700', stripe: 'stat-stripe-ink' },
};

export default function StatCard({ label, value, hint, icon: Icon, accent = 'teal' }) {
  const { icon: iconClass, stripe } = accents[accent] || accents.teal;
  return (
    <div className="panel relative min-h-[118px] overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-lg">
      <div className={`stat-stripe ${stripe}`} />
      <div className="flex h-full items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black leading-none text-ink">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/60 ${iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
