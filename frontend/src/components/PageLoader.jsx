import React from 'react';
import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex h-full w-full min-h-[50vh] items-center justify-center p-8 flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      <p className="text-sm font-semibold text-slate-500 font-display animate-pulse tracking-tight">
        Loading...
      </p>
    </div>
  );
}
