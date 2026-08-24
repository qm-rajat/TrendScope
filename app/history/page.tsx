'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CountrySelector } from '@/components/CountrySelector';
import { TrendChart } from '@/components/TrendChart';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { TrendsApiResponse, LocationConfig, TrendItem } from '@/types/trends';
import { DEFAULT_LOCATION } from '@/lib/locations';
import { generateDemoTrendHistory } from '@/lib/demo-data';
import { formatTweetVolume } from '@/lib/trend-utils';
import { History, Search, ArrowUpRight, Clock } from 'lucide-react';

export default function TrendHistoryPage() {
  const [location, setLocation] = useState<LocationConfig>(DEFAULT_LOCATION);
  const [data, setData] = useState<TrendsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const res = await fetch(`/api/trends?location=${encodeURIComponent(location.slug)}&limit=50`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to load trends history');
        const json: TrendsApiResponse = await res.json();
        if (isMounted) {
          setData(json);
          setError(null);
          setIsLoading(false);
          if (json.trends && json.trends.length > 0) {
            setSelectedTrend((prev) => {
              if (prev) {
                const match = json.trends.find((t) => t.name === prev.name);
                return match || json.trends[0];
              }
              return json.trends[0];
            });
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error loading trend history');
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [location.slug, refreshCounter]);

  const trendsList = data?.trends || [];
  const filteredTrends = trendsList.filter((t) =>
    t.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Generate historical movement checkpoints for selected trend
  const historyData = selectedTrend
    ? generateDemoTrendHistory(selectedTrend.name, selectedTrend.rank)
    : [];

  return (
    <DashboardLayout
      currentLocationSlug={location.slug}
      onSelectLocation={(loc) => {
        setIsLoading(true);
        setLocation(loc);
      }}
      onRefresh={() => setRefreshCounter((c) => c + 1)}
      isDemo={data?.isDemo ?? true}
      navigateOnSelect={false}
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1E293B]/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Historical Trend Movement
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              30m Snapshots
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Track historical rank trajectory, peak rankings, and velocity shifts over time.
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

      {error && (
        <ErrorState message={error} onRetry={() => setRefreshCounter((c) => c + 1)} />
      )}

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="space-y-6">
          {/* Active Trend History Hero Display */}
          {selectedTrend && (
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-blue-500/30 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-300 font-mono font-bold">
                      Current Rank #{selectedTrend.rank}
                    </span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      {selectedTrend.type}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">{selectedTrend.name}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block">Total Volume</span>
                    <span className="text-base font-bold font-mono text-cyan-400">
                      {formatTweetVolume(selectedTrend.tweetVolume)}
                    </span>
                  </div>
                  <a
                    href={selectedTrend.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    title="View on X"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Trajectory Checkpoints Stepper (e.g. 10:00 -> #45, 10:30 -> #27, etc.) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Rank Progression History (Last 4 Hours)
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                  {historyData.map((pt, idx) => {
                    const isLatest = idx === historyData.length - 1;
                    return (
                      <div
                        key={pt.timeLabel}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isLatest
                            ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                            : 'bg-[#070B14] border-[#1E2D4A] text-slate-300'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {pt.timeLabel}
                        </div>
                        <div
                          className={`text-sm font-mono mt-1 ${
                            isLatest
                              ? 'text-cyan-300 font-extrabold'
                              : pt.rank <= 5
                              ? 'text-emerald-400 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          #{pt.rank}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recharts Inverted Trajectory Visualizer */}
          {selectedTrend && (
            <TrendChart
              historyData={historyData}
              trendName={selectedTrend.name}
              trends={trendsList}
            />
          )}

          {/* Trend Selector Grid */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Select Trend To Inspect Trajectory
                </h3>
                <p className="text-xs text-slate-400">
                  Click any trending topic from {location.name} to view its historical graph
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter topics..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#070B14] border border-[#1E2D4A] rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredTrends.map((t) => {
                const isSelected = selectedTrend?.name === t.name;
                return (
                  <button
                    key={`${t.rank}-${t.name}`}
                    onClick={() => setSelectedTrend(t)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white font-semibold shadow-xs'
                        : 'bg-[#070B14] border-[#1E293B] hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs truncate font-medium">{t.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatTweetVolume(t.tweetVolume)}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-[#141E33] text-cyan-400'
                      }`}
                    >
                      #{t.rank}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
