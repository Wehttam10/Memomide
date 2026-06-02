const styles = {
  Strong: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  Good: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-100',
  Weak: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-100',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ring-4 ${styles[status] || styles.Weak}`}>
      {status}
    </span>
  );
}
