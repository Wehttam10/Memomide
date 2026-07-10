const styles = {
  Strong: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 font-mono text-[10px] uppercase tracking-wider',
  Good: 'bg-teal-50 text-teal-700 border-teal-200/60 font-mono text-[10px] uppercase tracking-wider',
  Weak: 'bg-amber-50 text-amber-700 border-amber-200/60 font-mono text-[10px] uppercase tracking-wider',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200/60 border-dashed font-mono text-[10px] uppercase tracking-wider animate-pulse',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded px-2 py-0.5 text-xs font-bold border ${styles[status] || styles.Weak}`}>
      {status}
    </span>
  );
}
