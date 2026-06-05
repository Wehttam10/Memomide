const styles = {
  Strong: 'bg-neutral-900 text-white border-neutral-900 font-mono text-[10px] uppercase tracking-wider',
  Good: 'bg-neutral-100 text-neutral-950 border-neutral-300 font-mono text-[10px] uppercase tracking-wider',
  Weak: 'bg-white text-neutral-600 border-neutral-250 font-mono text-[10px] uppercase tracking-wider',
  Critical: 'bg-white text-neutral-950 border-neutral-400 border-dashed font-mono text-[10px] uppercase tracking-wider',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded px-2 py-0.5 text-xs font-bold border ${styles[status] || styles.Weak}`}>
      {status}
    </span>
  );
}
