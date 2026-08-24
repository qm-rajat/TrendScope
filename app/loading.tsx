import React from 'react';
import { SummarySkeleton, TableSkeleton } from '@/components/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-slate-800/60 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-44 bg-slate-800 rounded-xl animate-pulse" />
      </div>

      <SummarySkeleton />
      <TableSkeleton rows={10} />
    </div>
  );
}
