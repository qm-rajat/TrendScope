'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CountrySelector } from '@/components/CountrySelector';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { LocationConfig, TrendsApiResponse } from '@/types/trends';
import { getLocationBySlug } from '@/lib/locations';
import { fetchTrendsData } from '@/lib/api-client';
import { compareCountryTrends, formatTweetVolume } from '@/lib/trend-utils';
import { GitCompare, ArrowRightLeft, ExternalLink, Globe2, Sparkles } from 'lucide-react';

export default function CountryComparisonPage() {
  const [country1, setCountry1] = useState<LocationConfig>(getLocationBySlug('india'));
  const [country2, setCountry2] = useState<LocationConfig>(getLocationBySlug('usa'));
  const [data1, setData1] = useState<TrendsApiResponse | null>(null);
  const [data2, setData2] = useState<TrendsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'crossOnly' | 'exclusive1' | 'exclusive2'>('all');
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadComparison() {
      try {
        const force = refreshCounter > 0;
        const [json1, json2] = await Promise.all([
          fetchTrendsData(country1.slug, 50, force),
          fetchTrendsData(country2.slug, 50, force),
        ]);

        if (isMounted) {
          setData1(json1);
          setData2(json2);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching comparison data');
          setIsLoading(false);
        }
      }
    }

    loadComparison();

    return () => {
      isMounted = false;
    };
  }, [country1.slug, country2.slug, refreshCounter]);

  const handleSwap = () => {
    setIsLoading(true);
    const temp = country1;
    setCountry1(country2);
    setCountry2(temp);
  };

  const trends1 = data1?.trends || [];
  const trends2 = data2?.trends || [];

  const { comparisons, crossCountryCount, country1Exclusive, country2Exclusive } =
    compareCountryTrends(trends1, trends2);

  const filteredComparisons = comparisons.filter((item) => {
    if (filterMode === 'crossOnly') return item.isCrossCountry;
    if (filterMode === 'exclusive1') return item.country1Rank !== null && item.country2Rank === null;
    if (filterMode === 'exclusive2') return item.country2Rank !== null && item.country1Rank === null;
    return true;
  });

  return (
    <DashboardLayout currentLocationSlug={country1.slug} navigateOnSelect={false}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1E293B]/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitCompare className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Country vs Country Intelligence
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Cross-Border Analysis
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Compare concurrent topic rankings and identify cross-country viral movements.
          </p>
        </div>
      </div>

      {/* Dual Selector Control Panel */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Country 1 Picker */}
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Location A (Primary)
          </label>
          <CountrySelector
            currentLocationSlug={country1.slug}
            onSelectLocation={(loc) => {
              setIsLoading(true);
              setCountry1(loc);
            }}
            className="w-full"
          />
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="p-3 rounded-2xl bg-[#141E33] hover:bg-[#1E2D4A] border border-[#1E2D4A] text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer shadow-xs shrink-0 self-center mt-4 md:mt-5"
          title="Swap locations"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Country 2 Picker */}
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Location B (Comparison)
          </label>
          <CountrySelector
            currentLocationSlug={country2.slug}
            onSelectLocation={(loc) => {
              setIsLoading(true);
              setCountry2(loc);
            }}
            className="w-full"
          />
        </div>
      </div>

      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            setIsLoading(true);
            setRefreshCounter((c) => c + 1);
          }}
        />
      )}

      {/* Metric Cards for Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="p-4 md:p-5 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-cyan-300 font-medium">Cross-Country Trends</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{crossCountryCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Trending simultaneously in both regions</p>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-300 font-medium">{country1.name} Exclusives</span>
            <span className="text-lg">{country1.flag}</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{country1Exclusive}</div>
          <p className="text-[11px] text-slate-400 mt-1">Unique to {country1.name} feed</p>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-300 font-medium">{country2.name} Exclusives</span>
            <span className="text-lg">{country2.flag}</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{country2Exclusive}</div>
          <p className="text-[11px] text-slate-400 mt-1">Unique to {country2.name} feed</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            filterMode === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-[#0F172A] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
          }`}
        >
          All Topics ({comparisons.length})
        </button>
        <button
          onClick={() => setFilterMode('crossOnly')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            filterMode === 'crossOnly'
              ? 'bg-cyan-600 text-white'
              : 'bg-[#0F172A] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
          }`}
        >
          🌐 Cross-Country Shared ({crossCountryCount})
        </button>
        <button
          onClick={() => setFilterMode('exclusive1')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            filterMode === 'exclusive1'
              ? 'bg-blue-600 text-white'
              : 'bg-[#0F172A] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
          }`}
        >
          {country1.flag} {country1.name} Only ({country1Exclusive})
        </button>
        <button
          onClick={() => setFilterMode('exclusive2')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            filterMode === 'exclusive2'
              ? 'bg-purple-600 text-white'
              : 'bg-[#0F172A] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
          }`}
        >
          {country2.flag} {country2.name} Only ({country2Exclusive})
        </button>
      </div>

      {/* Comparison Table */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0A0F1D] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Topic / Hashtag</th>
                  <th className="py-3.5 px-4 text-center">
                    {country1.flag} {country1.name} Rank
                  </th>
                  <th className="py-3.5 px-4 text-center">
                    {country2.flag} {country2.name} Rank
                  </th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4 text-right">Volume (Max)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {filteredComparisons.length > 0 ? (
                  filteredComparisons.map((c, idx) => {
                    const maxVol = Math.max(c.country1Volume || 0, c.country2Volume || 0);

                    return (
                      <tr
                        key={`${idx}-${c.name}`}
                        className={`hover:bg-[#141F38]/50 transition-colors ${
                          c.isCrossCountry ? 'bg-cyan-950/10' : ''
                        }`}
                      >
                        {/* Topic Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={c.searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-slate-100 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>{c.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                            </a>
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                                c.type === 'hashtag'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-purple-500/10 text-purple-400'
                              }`}
                            >
                              {c.type}
                            </span>
                          </div>
                        </td>

                        {/* Country 1 Rank */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          {c.country1Rank !== null ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30">
                              #{c.country1Rank}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-sm">—</span>
                          )}
                        </td>

                        {/* Country 2 Rank */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          {c.country2Rank !== null ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30">
                              #{c.country2Rank}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-sm">—</span>
                          )}
                        </td>

                        {/* Cross Country Badge */}
                        <td className="py-3.5 px-4">
                          {c.isCrossCountry ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              <Sparkles className="w-3 h-3" /> Cross-Country
                            </span>
                          ) : c.country1Rank !== null ? (
                            <span className="text-[10px] text-slate-400">
                              Exclusive to {country1.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Exclusive to {country2.name}
                            </span>
                          )}
                        </td>

                        {/* Volume */}
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300 font-medium">
                          {formatTweetVolume(maxVol > 0 ? maxVol : null)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                      No topics found for this filter combination.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
