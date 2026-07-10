import { Link } from 'react-router-dom';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  actionTo, 
  action,
  variant = 'default' 
}) {
  const ActionTag = actionTo ? Link : 'button';

  // Support clean neutral look by default, and a subtle brand tint optionally
  const containerClasses = variant === 'brand'
    ? 'flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-teal-200/80 bg-teal-50/20 px-6 py-10 text-center transition-all duration-300 ease-elegant shadow-sm'
    : 'flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center transition-all duration-300 ease-elegant shadow-sm';

  const iconWrapperClasses = variant === 'brand'
    ? 'mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-650 shadow-sm border border-teal-100 ring-4 ring-teal-50/50'
    : 'mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-200/60 ring-4 ring-slate-50/50';

  return (
    <div className={containerClasses}>
      {Icon ? (
        <div className={iconWrapperClasses}>
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="text-sm font-bold font-display tracking-tight text-slate-900">{title}</h3>
      <p className="mt-2.5 max-w-sm text-xs leading-relaxed text-slate-550">{message}</p>
      {actionLabel ? (
        <ActionTag className="btn-primary mt-5 text-xs py-1.5 px-4" to={actionTo} type={actionTo ? undefined : 'button'} onClick={action}>
          {actionLabel}
        </ActionTag>
      ) : null}
    </div>
  );
}

