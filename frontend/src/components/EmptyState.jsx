import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, message, actionLabel, actionTo, action }) {
  const ActionTag = actionTo ? Link : 'button';

  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-teal/25 bg-[#edf8f5]/70 px-6 py-10 text-center">
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/80 text-teal shadow-sm ring-1 ring-teal/15">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {actionLabel ? (
        <ActionTag className="btn-primary mt-5" to={actionTo} type={actionTo ? undefined : 'button'} onClick={action}>
          {actionLabel}
        </ActionTag>
      ) : null}
    </div>
  );
}
