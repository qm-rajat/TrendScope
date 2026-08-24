'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SummaryCards } from '@/components/SummaryCard';
import { TrendTable } from '@/components/TrendTable';
import { TrendChart } from '@/components/TrendChart';
import { SummarySkeleton, TableSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { TrendsApiResponse, LocationConfig } from '@/types/trends';
import { LOCATIONS, DEFAULT_LOCATION } from '@/lib/locations';
import { fetchTrendsData } from '@/lib/api-client';
import { Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const [selectedLocation, setSelectedLocation] = useState<LocationConfig>(DEFAULT_LOCATION);
  const [data, setData] = useState<TrendsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Effect to load data asynchronously
  useEffect(() => {
    let isMounted = true;

    async function loadTrends() {
      try {
        const force = refreshCounter > 0;
        const json = await fetchTrendsData(selectedLocation.slug, 50, force);
        if (isMounted) {
          setData(json);
          setError(null);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load trends from server.';
          setError(msg);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadTrends();

    return () => {
      isMounted = false;
    };
  }, [selectedLocation.slug, refreshCounter]);

  // Handle location selection
  const handleSelectLocation = (loc: LocationConfig) => {
    setIsLoading(true);
    setSelectedLocation(loc);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshCounter((c) => c + 1);
  };

  // Calculate metrics
  const trendsList = data?.trends || [];
  const emergingCount = trendsList.filter(
    (t) => t.status === 'EXPLODING' || t.status === 'RISING'
  ).length;

  return (
    <DashboardLayout
      currentLocationSlug={selectedLocation.slug}
      onSelectLocation={handleSelectLocation}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      isDemo={data?.isDemo ?? true}
      navigateOnSelect={false}
    >
      {/* Hero / Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#1E293B]/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Trending Now
            </span>
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1">
              <span>{selectedLocation.flag}</span>
              <span>{selectedLocation.name}</span>
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Monitor trending topics and hashtags across X by location with real-time velocity metrics.
          </p>
        </div>

        {/* Quick Country Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {LOCATIONS.filter((l) => l.popular).slice(0, 6).map((loc) => {
            const isSelected = loc.slug === selectedLocation.slug;
            return (
              <button
                key={loc.slug}
                id={`btn-quick-filter-${loc.slug}`}
                onClick={() => handleSelectLocation(loc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                    : 'bg-[#0F172A] hover:bg-[#15203B] text-slate-300 border border-[#1E293B]'
                }`}
              >
                <span>{loc.flag}</span>
                <span>{loc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Banner if any */}
      {error && (
        <ErrorState
          message={error}
          onRetry={handleRefresh}
          isRetrying={isRefreshing}
          type={error.includes('rate limit') ? 'rateLimit' : 'general'}
        />
      )}

      {/* Main Content Body */}
      {isLoading ? (
        <div className="space-y-6">
          <SummarySkeleton />
          <TableSkeleton rows={10} />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <SummaryCards
            trendingCount={trendsList.length}
            locationsCount={195}
            emergingCount={emergingCount}
            updatedAt={data.updatedAt}
            sourceLabel={data.isDemo ? 'Demo Mode Feed' : 'GetXAPI Live Feed'}
          />

          {/* Volume Analytics Chart */}
          {trendsList.length > 0 && (
            <TrendChart trends={trendsList} trendName={trendsList[0]?.name} />
          )}

          {/* Main Trends Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Live Rankings</h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#141E33] text-slate-300 font-mono">
                  {trendsList.length} items
                </span>
              </div>

              {data.isDemo && (
                <div className="text-xs text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Showing Demo trends for {selectedLocation.name}</span>
                </div>
              )}
            </div>

            <TrendTable
              trends={trendsList}
              locationName={selectedLocation.name}
            />
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
