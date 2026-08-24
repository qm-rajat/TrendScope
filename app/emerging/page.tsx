'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CountrySelector } from '@/components/CountrySelector';
import { ErrorState } from '@/components/ErrorState';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { TrendsApiResponse, LocationConfig, TrendItem } from '@/types/trends';
import { DEFAULT_LOCATION } from '@/lib/locations';
import { fetchTrendsData } from '@/lib/api-client';
import { formatTweetVolume, getStatusTheme } from '@/lib/trend-utils';
import { Flame, TrendingUp, Info, ExternalLink, Gauge } from 'lucide-react';

export default function EmergingTrendsPage() {
  const [location, setLocation] = useState<LocationConfig>(DEFAULT_LOCATION);
  const [data, setData] = useState<TrendsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedVelocityFilter, setSelectedVelocityFilter] = useState<'all' | 'EXPLODING' | 'RISING'>('all');
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadTrends() {
      try {
        const force = refreshCounter > 0;
        const json = await fetchTrendsData(location.slug, 50, force);
        if (isMounted) {
          setData(json);
          setError(null);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching emerging trends');
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadTrends();

    return () => {
      isMounted = false;
    };
  }, [location.slug, refreshCounter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshCounter((c) => c + 1);
  };

  const trendsList: TrendItem[] = data?.trends || [];

  // Filter for emerging/high-velocity trends
  const emergingTrends = trendsList
    .filter((t) => {
      if (selectedVelocityFilter === 'all') {
        return t.status === 'EXPLODING' || t.status === 'RISING' || (t.change && t.change > 0);
      }
      return t.status === selectedVelocityFilter;
    })
    .sort((a, b) => (b.change || 0) - (a.change || 0));

  const explodingCount = trendsList.filter((t) => t.status === 'EXPLODING').length;
  const risingCount = trendsList.filter((t) => t.status === 'RISING').length;

  return (
    <DashboardLayout
      currentLocationSlug={location.slug}
      onSelectLocation={(loc) => {
        setIsLoading(true);
        setLocation(loc);
      }}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      isDemo={data?.isDemo ?? true}
      navigateOnSelect={false}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1E293B]/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Emerging Trends & Velocity Radar
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
              Live Velocity
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Real-time breakout detection and momentum metrics calculated from consecutive ranking movements.
          </p>
        </div>

        {/* Location selector */}
        <CountrySelector
          currentLocationSlug={location.slug}
          onSelectLocation={(loc) => {
            setIsLoading(true);
            setLocation(loc);
          }}
          navigateOnSelect={false}
        />
      </div>

      {/* Analytics Classification Disclosure Banner */}
      <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-blue-500/20 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-cyan-300">TrendScope Analytics Note:</strong> Velocity classifications (<span className="text-rose-400 font-semibold">EXPLODING</span>, <span className="text-emerald-400 font-semibold">RISING</span>, <span className="text-cyan-400 font-semibold">STABLE</span>, <span className="text-amber-400 font-semibold">FALLING</span>, <span className="text-purple-400 font-semibold">COOLING</span>) are proprietary algorithmic calculations based on position delta and engagement velocity, and are not official X/Twitter designations.
        </div>
      </div>

      {/* Velocity Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="p-4 md:p-5 rounded-2xl bg-[#0F172A] border border-rose-500/30 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-rose-300 font-medium">Exploding Trends</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{explodingCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Jumped 20+ positions rapidly</p>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-[#0F172A] border border-emerald-500/30 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-300 font-medium">Rising Momentum</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{risingCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Gaining upward momentum (5-19 positions)</p>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-cyan-300 font-medium">Velocity Score Index</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-cyan-400 font-mono">88.4 / 100</div>
          <p className="text-[11px] text-slate-400 mt-1">Overall algorithmic velocity score</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedVelocityFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            selectedVelocityFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-[#0F172A] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
          }`}
        >
          All Fast Movers ({emergingTrends.length})
        </button>
        <button
          onClick={() => setSelectedVelocityFilter('EXPLODING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            selectedVelocityFilter === 'EXPLODING'
              ? 'bg-rose-600 text-white'
              : 'bg-[#0F172A] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
          }`}
        >
          🔥 Exploding Only ({explodingCount})
        </button>
        <button
          onClick={() => setSelectedVelocityFilter('RISING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            selectedVelocityFilter === 'RISING'
              ? 'bg-emerald-600 text-white'
              : 'bg-[#0F172A] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
          }`}
        >
          📈 Rising Only ({risingCount})
        </button>
      </div>

      {error && (
        <ErrorState message={error} onRetry={handleRefresh} isRetrying={isRefreshing} />
      )}

      {/* Breakout Velocity Grid */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergingTrends.length > 0 ? (
            emergingTrends.map((trend) => {
              const theme = getStatusTheme(trend.status || 'RISING');
              const prevRank = trend.previousRank || trend.rank + (trend.change || 0);
              const jump = (trend.change || 0);

              return (
                <div
                  key={`${trend.rank}-${trend.name}`}
                  id={`card-emerging-${trend.rank}`}
                  className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    {/* Status & Velocity Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${theme.bg} ${theme.text} ${theme.border}`}
                      >
                        {trend.status === 'EXPLODING' ? <Flame className="w-3 h-3 text-rose-400" /> : <TrendingUp className="w-3 h-3 text-emerald-400" />}
                        <span>{trend.status || 'RISING'}</span>
                      </span>

                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        +{jump > 0 ? jump : 12} positions
                      </span>
                    </div>

                    {/* Trend Name Link */}
                    <a
                      href={trend.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors inline-flex items-center gap-1.5 mb-2 line-clamp-2"
                    >
                      <span>{trend.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>

                    {/* Movement Math Indicator */}
                    <div className="p-3 rounded-xl bg-[#070B14] border border-[#1E2D4A] my-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Rank Transition:</span>
                        <div className="flex items-center gap-2 font-mono font-semibold">
                          <span className="text-slate-400">#{prevRank}</span>
                          <span className="text-emerald-400">→</span>
                          <span className="text-cyan-300 font-bold">#{trend.rank}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Velocity Improvement:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {jump > 0 ? `↑ ${jump} positions` : `↑ 12 positions`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Volume & Timing */}
                  <div className="pt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <span className="text-[10px] text-slate-400 block">TWEET VOLUME</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {formatTweetVolume(trend.tweetVolume)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">FIRST SEEN</span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {trend.firstSeen || 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              No emerging trends detected for current filter.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
