'use client';

import React from 'react';
import { ExternalLink, Flame, TrendingUp, TrendingDown, ArrowDownRight, Minus, Sparkles } from 'lucide-react';
import { TrendItem } from '@/types/trends';
import { formatTweetVolume, getStatusTheme } from '@/lib/trend-utils';

interface TrendCardProps {
  trend: TrendItem;
  className?: string;
}

export function TrendCard({ trend, className = '' }: TrendCardProps) {
  const statusTheme = getStatusTheme(trend.status || 'STABLE');

  // Status icon component
  const renderStatusIcon = () => {
    switch (trend.status) {
      case 'EXPLODING':
        return <Flame className="w-3 h-3 text-rose-400" />;
      case 'RISING':
        return <TrendingUp className="w-3 h-3 text-emerald-400" />;
      case 'COOLING':
        return <TrendingDown className="w-3 h-3 text-purple-400" />;
      case 'FALLING':
        return <ArrowDownRight className="w-3 h-3 text-amber-400" />;
      case 'STABLE':
      default:
        return <Minus className="w-3 h-3 text-cyan-400" />;
    }
  };

  return (
    <div
      id={`trend-card-${trend.rank}-${encodeURIComponent(trend.name)}`}
      className={`p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] hover:border-blue-500/40 transition-all shadow-xs relative overflow-hidden group ${className}`}
    >
      {/* Top row: Rank, Type, Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#141E33] border border-[#1E2D4A] font-mono font-bold text-xs text-cyan-400">
            #{trend.rank}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
              trend.type === 'hashtag'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            }`}
          >
            {trend.type}
          </span>
          {trend.promoted && (
            <span className="text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-2.5 h-2.5" /> Promoted
            </span>
          )}
        </div>

        {/* Velocity Status Pill */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusTheme.bg} ${statusTheme.text} ${statusTheme.border}`}
        >
          {renderStatusIcon()}
          <span>{statusTheme.label}</span>
        </div>
      </div>

      {/* Main Trend Name (Clickable to X in new tab) */}
      <div className="my-2.5">
        <a
          id={`link-trend-card-${trend.rank}`}
          href={trend.searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold text-slate-100 group-hover:text-blue-400 transition-colors inline-flex items-center gap-1.5 break-all line-clamp-2"
        >
          <span>{trend.name}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
        </a>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="pt-2.5 border-t border-[#1E293B]/70 flex items-center justify-between text-xs text-slate-400">
        <div>
          <span className="text-[10px] uppercase text-slate-500 block">Volume</span>
          <span className="font-mono font-semibold text-slate-200">
            {formatTweetVolume(trend.tweetVolume)}
          </span>
        </div>

        <div className="text-center">
          <span className="text-[10px] uppercase text-slate-500 block">Change</span>
          <span
            className={`font-mono font-semibold ${
              trend.change && trend.change > 0
                ? 'text-emerald-400'
                : trend.change && trend.change < 0
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {trend.change && trend.change > 0
              ? `↑ ${trend.change}`
              : trend.change && trend.change < 0
              ? `↓ ${Math.abs(trend.change)}`
              : '• 0'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase text-slate-500 block">First Seen</span>
          <span className="text-slate-300 text-[11px]">
            {trend.firstSeen || 'Recently'}
          </span>
        </div>
      </div>
    </div>
  );
}
