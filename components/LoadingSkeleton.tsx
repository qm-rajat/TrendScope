'use client';

import React from 'react';

export function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-4 md:p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-slate-800 rounded-md" />
            <div className="h-8 w-8 bg-slate-800 rounded-xl" />
          </div>
          <div className="h-8 w-16 bg-slate-800 rounded-md" />
          <div className="h-2.5 w-28 bg-slate-800/60 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Control bar skeleton */}
      <div className="h-14 rounded-2xl bg-[#0F172A] border border-[#1E293B]" />

      {/* Desktop table skeleton */}
      <div className="hidden md:block rounded-2xl bg-[#0F172A] border border-[#1E293B] overflow-hidden p-4 space-y-3">
        <div className="h-8 bg-slate-800/80 rounded-xl" />
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/40">
            <div className="h-6 w-8 bg-slate-800 rounded-md" />
            <div className="h-5 w-48 bg-slate-800 rounded-md" />
            <div className="h-5 w-16 bg-slate-800 rounded-md" />
            <div className="h-5 w-20 bg-slate-800 rounded-md" />
            <div className="h-5 w-12 bg-slate-800 rounded-md" />
            <div className="h-5 w-16 bg-slate-800 rounded-md" />
            <div className="h-6 w-20 bg-slate-800 rounded-full" />
          </div>
        ))}
      </div>

      {/* Mobile card skeletons */}
      <div className="block md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
            <div className="flex justify-between">
              <div className="h-6 w-20 bg-slate-800 rounded-md" />
              <div className="h-5 w-16 bg-slate-800 rounded-full" />
            </div>
            <div className="h-5 w-40 bg-slate-800 rounded-md" />
            <div className="h-4 w-full bg-slate-800/50 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="h-4 w-32 bg-slate-800 rounded-md" />
          <div className="h-3 w-48 bg-slate-800/60 rounded-md" />
        </div>
        <div className="h-8 w-32 bg-slate-800 rounded-xl" />
      </div>
      <div className="h-56 bg-slate-800/30 rounded-xl flex items-center justify-center">
        <div className="h-3 w-32 bg-slate-800 rounded-md" />
      </div>
    </div>
  );
}
