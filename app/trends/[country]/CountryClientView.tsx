'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SummaryCards } from '@/components/SummaryCard';
import { TrendTable } from '@/components/TrendTable';
import { TrendChart } from '@/components/TrendChart';
import { SummarySkeleton, TableSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { TrendsApiResponse, LocationConfig } from '@/types/trends';
import { getLocationBySlug } from '@/lib/locations';
import { Flame, Hash, GitCompare, History, ArrowLeft } from 'lucide-react';

interface CountryClientViewProps {
  countrySlug: string;
  initialData?: TrendsApiResponse;
}

export function CountryClientView({
  countrySlug,
  initialData,
}: CountryClientViewProps) {
  const router = useRouter();
  const locationConfig = getLocationBySlug(countrySlug);
  const [data, setData] = useState<TrendsApiResponse | null>(initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const isInitialMount = React.useRef(true);

  useEffect(() => {
    let isMounted = true;

    // If initial data is provided, skip the redundant initial mount fetch
    if (isInitialMount.current && initialData) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;

    async function loadCountryTrends() {
      try {
        const force = refreshCounter > 0;
        const res = await fetch(
          `/api/trends?location=${encodeURIComponent(countrySlug)}&limit=50${force ? '&force=true' : ''}`,
          { cache: 'no-store' }
        );

        if (!res.ok) {
          throw new Error('Failed to retrieve trends for this country.');
        }

        const json: TrendsApiResponse = await res.json();
        if (isMounted) {
          setData(json);
          setError(null);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Error fetching country trends';
          setError(msg);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadCountryTrends();

    return () => {
      isMounted = false;
    };
  }, [countrySlug, refreshCounter, initialData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshCounter((c) => c + 1);
  };

  const handleSelectLocation = (loc: LocationConfig) => {
    if (loc.slug === 'worldwide') {
      router.push('/');
    } else {
      router.push(`/trends/${loc.slug}`);
    }
  };

  const trendsList = data?.trends || [];
  const topHashtags = trendsList.filter((t) => t.type === 'hashtag').slice(0, 5);
  const emergingTrends = trendsList
    .filter((t) => t.status === 'EXPLODING' || t.status === 'RISING')
    .slice(0, 5);

  return (
    <DashboardLayout
      currentLocationSlug={countrySlug}
      onSelectLocation={handleSelectLocation}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      isDemo={data?.isDemo ?? true}
      navigateOnSelect={true}
    >
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Worldwide</span>
        </Link>
        <span>/</span>
        <Link href="/countries" className="hover:text-blue-400 transition-colors">
          Countries
        </Link>
        <span>/</span>
        <span className="text-white font-medium">{locationConfig.name}</span>
      </div>

      {/* Country Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B]">
        <div className="flex items-center gap-3.5">
          <div className="text-4xl p-2 rounded-2xl bg-[#141E33] border border-[#1E2D4A] flex items-center justify-center">
            {locationConfig.flag}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {locationConfig.name} X Trends Today
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {locationConfig.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live ranked topics, hashtags, and engagement velocity in {locationConfig.name}.
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <Link
            href={`/compare?c1=${countrySlug}&c2=worldwide`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141E33] hover:bg-[#1E2D4A] text-xs font-medium text-slate-200 border border-[#1E2D4A] transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5 text-blue-400" />
            <span>Compare vs Worldwide</span>
          </Link>
          <Link
            href={`/history?trend=${encodeURIComponent(trendsList[0]?.name || '')}&location=${countrySlug}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141E33] hover:bg-[#1E2D4A] text-xs font-medium text-slate-200 border border-[#1E2D4A] transition-colors"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>History</span>
          </Link>
        </div>
      </div>

      {error && (
        <ErrorState message={error} onRetry={handleRefresh} isRetrying={isRefreshing} />
      )}

      {isLoading ? (
        <div className="space-y-6">
          <SummarySkeleton />
          <TableSkeleton rows={8} />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <SummaryCards
            trendingCount={trendsList.length}
            locationsCount={195}
            emergingCount={emergingTrends.length}
            updatedAt={data.updatedAt}
            sourceLabel={data.isDemo ? 'Demo Mode Feed' : 'GetXAPI Live Feed'}
          />

          {/* Quick Highlighting Panels: Top Hashtags & Emerging Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Hashtags in this Country */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">Top Hashtags in {locationConfig.name}</h2>
                </div>
                <span className="text-[11px] text-slate-400"># Ranked</span>
              </div>
              <div className="space-y-2">
                {topHashtags.length > 0 ? (
                  topHashtags.map((h) => (
                    <div
                      key={h.rank}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#070B14] border border-[#1E293B]/60 text-xs hover:border-blue-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">#{h.rank}</span>
                        <a
                          href={h.searchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-200 hover:text-blue-400"
                        >
                          {h.name}
                        </a>
                      </div>
                      <span className="font-mono text-slate-400">
                        {h.tweetVolume ? `${(h.tweetVolume / 1000).toFixed(1)}K` : 'Active'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">No hashtags found</p>
                )}
              </div>
            </div>

            {/* High Velocity / Emerging in this Country */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">Emerging & Exploding Trends</h2>
                </div>
                <span className="text-[11px] text-rose-400 font-medium">Velocity Radar</span>
              </div>
              <div className="space-y-2">
                {emergingTrends.length > 0 ? (
                  emergingTrends.map((e) => (
                    <div
                      key={e.rank}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#070B14] border border-[#1E293B]/60 text-xs hover:border-rose-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-rose-400 font-bold">#{e.rank}</span>
                        <a
                          href={e.searchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-200 hover:text-rose-400"
                        >
                          {e.name}
                        </a>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        {e.change && e.change > 0 ? `+${e.change} pos` : 'Exploding'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">No explosive trends right now</p>
                )}
              </div>
            </div>
          </div>

          {/* Volume Analytics Chart */}
          {trendsList.length > 0 && (
            <TrendChart trends={trendsList} trendName={trendsList[0]?.name} />
          )}

          {/* Main Trends Table */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>All Trends in {locationConfig.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#141E33] text-slate-300 font-mono">
                {trendsList.length} total
              </span>
            </h2>
            <TrendTable trends={trendsList} locationName={locationConfig.name} />
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
