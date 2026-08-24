'use client';

import React from 'react';
import { TrendingUp, Globe2, Flame, Clock } from 'lucide-react';

interface SummaryCardProps {
  trendingCount: number;
  locationsCount?: number;
  emergingCount: number;
  updatedAt?: string;
  sourceLabel?: string;
}

export function SummaryCards({
  trendingCount,
  locationsCount = 195,
  emergingCount,
  updatedAt,
  sourceLabel,
}: SummaryCardProps) {
  // Format last updated
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const cards = [
    {
      id: 'card-trending-topics',
      label: 'Trending Topics',
      value: trendingCount.toString(),
      subtext: 'Active ranked trends',
      icon: TrendingUp,
      accentColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      badge: 'Real-time',
    },
    {
      id: 'card-locations-monitored',
      label: 'Locations',
      value: locationsCount.toString(),
      subtext: 'Global coverage on X',
      icon: Globe2,
      accentColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      badge: 'Worldwide',
    },
    {
      id: 'card-emerging-trends',
      label: 'Emerging',
      value: emergingCount.toString(),
      subtext: 'High velocity & exploding',
      icon: Flame,
      accentColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      badge: 'High Velocity',
    },
    {
      id: 'card-last-updated',
      label: 'Last Refreshed',
      value: formatTime(updatedAt),
      subtext: sourceLabel || 'Cached Data Feed',
      icon: Clock,
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      badge: 'Cached Data',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="p-4 md:p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] hover:border-slate-700 transition-all shadow-xs relative overflow-hidden group"
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.accentColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            {/* Metric Value */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                {card.value}
              </span>
            </div>

            {/* Subtext and mini badge */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">{card.subtext}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${card.bgColor} ${card.accentColor} shrink-0`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
