export default function Loading({ label = 'Loading', rows = 3 }) {
  return (
    <div className="panel animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-64 max-w-full rounded bg-slate-100" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-slate-100" />
      </div>
      <div className="mt-6 grid gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-12 rounded-md bg-slate-100" />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
