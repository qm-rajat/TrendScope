'use client';

import React, { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Hash,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  Globe2,
  ChevronDown,
  X as CloseIcon,
  SlidersHorizontal,
  LogOut,
  Lock,
} from 'lucide-react';
import { LOCATIONS, DEFAULT_LOCATION } from '@/lib/locations';
import { LocationConfig, TrendItem } from '@/types/trends';
import { fetchTrendsData } from '@/lib/api-client';
import { formatTweetVolume } from '@/lib/trend-utils';
import { TrendScopeLogo } from '@/components/TrendScopeLogo';
import { PortalGate } from '@/components/PortalGate';
import { usePortalSession, clearActiveSession } from '@/lib/auth-session';

export default function HashtagSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const session = usePortalSession();

  // Selected Country
  const initialCountrySlug = searchParams.get('country') || 'worldwide';
  const initialLoc = useMemo(() => {
    return (
      LOCATIONS.find(
        (l) => l.slug.toLowerCase() === initialCountrySlug.toLowerCase() || l.code.toLowerCase() === initialCountrySlug.toLowerCase()
      ) || DEFAULT_LOCATION
    );
  }, [initialCountrySlug]);

  const [selectedLocation, setSelectedLocation] = useState<LocationConfig>(initialLoc);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter country suggestions based on query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Show popular countries first
      return LOCATIONS.filter((l) => l.popular).slice(0, 10);
    }
    return LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        Boolean(l.region && l.region.toLowerCase().includes(q))
    ).slice(0, 12);
  }, [searchQuery]);

  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fetch trends when selectedLocation or refreshCounter changes
  useEffect(() => {
    let isMounted = true;

    async function fetchLocationHashtags() {
      try {
        const force = refreshCounter > 0;
        const data = await fetchTrendsData(selectedLocation.slug, 50, force);
        if (isMounted) {
          setTrends(data.trends || []);
          setLastRefreshedAt(new Date());
          setIsLoading(false);
          setIsRefreshing(false);
        }
      } catch {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    fetchLocationHashtags();

    return () => {
      isMounted = false;
    };
  }, [selectedLocation.slug, refreshCounter]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshCounter((c) => c + 1);
  };

  // Extract exactly top 10 hashtags
  const top10Hashtags = useMemo(() => {
    if (!trends || trends.length === 0) return [];

    // Prioritize items that are already hashtags
    const hashtagsOnly = trends.filter((t) => t.type === 'hashtag' || t.name.startsWith('#'));
    const otherTrends = trends.filter((t) => t.type !== 'hashtag' && !t.name.startsWith('#'));

    // Combined up to 10
    const combined = [...hashtagsOnly];
    if (combined.length < 10) {
      for (const item of otherTrends) {
        if (combined.length >= 10) break;
        // Format as clean hashtag
        const formattedName = `#${item.name.replace(/[\s\-_]+/g, '')}`;
        combined.push({
          ...item,
          name: formattedName,
          type: 'hashtag',
        });
      }
    }

    return combined.slice(0, 10);
  }, [trends]);

  // Handle Country Pick
  const handleSelectCountry = (loc: LocationConfig) => {
    setSelectedLocation(loc);
    setSearchQuery('');
    setIsDropdownOpen(false);
    router.replace(`/hashtags?country=${loc.slug}`, { scroll: false });
  };

  // 1-Click Copy Individual Hashtag
  const handleCopySingle = (text: string, index: number) => {
    const formatted = text.startsWith('#') ? text : `#${text}`;
    navigator.clipboard.writeText(formatted);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 1-Click Copy All Top 10
  const handleCopyAll = () => {
    const allTags = top10Hashtags
      .map((t) => (t.name.startsWith('#') ? t.name : `#${t.name}`))
      .join(' ');
    navigator.clipboard.writeText(allTags);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // If not authenticated for Hashtags Portal (7491)
  if (session !== 'hashtags_7491') {
    return (
      <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-center selection:bg-blue-600 selection:text-white">
        <PortalGate
          requiredPortal="hashtags_7491"
          title="Top 10 Hashtags Portal (7491)"
          subtitle="This workspace is isolated. Enter code 7491 to unlock country hashtag search & copy."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Ambient Light Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Top Minimal Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#070B14]/80 backdrop-blur-md border-b border-[#1E293B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <TrendScopeLogo size={34} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white">
                  TrendScope
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Hashtags (7491)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block">Top 10 Country Hashtag Finder</span>
            </div>
          </div>

          {/* Action buttons: Switch & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-hashtags-switch"
              type="button"
              onClick={() => {
                clearActiveSession();
                router.push('/');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Switch to</span>
              <span>Advance (7492)</span>
            </button>

            <button
              id="btn-hashtags-logout"
              type="button"
              onClick={() => clearActiveSession()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real-Time X/Twitter Hashtag Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Search Top 10 Hashtags by Country
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Type any country name below to instantly retrieve the top 10 trending hashtags and copy them with one click.
          </p>
        </div>

        {/* Big Search Input with Real-Time Suggestions Dropdown */}
        <div ref={searchContainerRef} className="relative max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-indigo-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all opacity-60" />
            <div className="relative flex items-center bg-[#0F172A] border-2 border-[#1E293B] focus-within:border-cyan-500 rounded-2xl shadow-xl transition-all">
              <div className="pl-4 sm:pl-5 text-slate-400">
                <Search className="w-5 h-5 text-cyan-400" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder={`Search 195+ countries (current: ${selectedLocation.flag} ${selectedLocation.name})...`}
                className="w-full py-4 pl-3 pr-10 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-hidden"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="pr-4 text-slate-400 hover:text-white"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="pr-4 sm:pr-5 text-slate-400 hover:text-slate-200"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#1E293B]/50">
              <div className="p-2.5 bg-[#0B132B] text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                <span>{searchQuery ? `Matching Countries (${filteredCountries.length})` : 'Popular Countries & Territories'}</span>
                <span className="text-slate-500">Press Esc to close</span>
              </div>

              {filteredCountries.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No country found matching &ldquo;{searchQuery}&rdquo;. Try another name or ISO code.
                </div>
              ) : (
                filteredCountries.map((loc) => {
                  const isCurrent = loc.slug === selectedLocation.slug;
                  return (
                    <button
                      key={loc.slug}
                      type="button"
                      onClick={() => handleSelectCountry(loc)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600/15 text-white font-semibold'
                          : 'text-slate-300 hover:bg-[#1E293B]/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{loc.flag}</span>
                        <div>
                          <div className="text-sm font-medium">{loc.name}</div>
                          <div className="text-xs text-slate-400">
                            {loc.region} • <span className="font-mono">{loc.code}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {loc.popular && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            Popular
                          </span>
                        )}
                        {isCurrent && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Quick-Pick Popular Country Chips */}
          <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-slate-400" /> Quick select:
            </span>
            {LOCATIONS.filter((l) => l.popular).slice(0, 8).map((loc) => (
              <button
                key={loc.slug}
                type="button"
                onClick={() => handleSelectCountry(loc)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                  loc.slug === selectedLocation.slug
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                    : 'bg-[#0F172A] text-slate-300 border-[#1E293B] hover:border-slate-600 hover:text-white'
                }`}
              >
                <span>{loc.flag}</span>
                <span>{loc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hashtags Card Container */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-xl overflow-hidden">
          {/* Card Top Header */}
          <div className="p-4 sm:p-6 border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B132B]/50">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{selectedLocation.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Top 10 Hashtags in {selectedLocation.name}
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Updated {lastRefreshedAt.toLocaleTimeString()} • Ranked by tweet volume and velocity
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing || isLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-200 hover:text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleCopyAll}
                disabled={top10Hashtags.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied All 10!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All 10 Hashtags</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hashtag List */}
          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-[#1E293B]/40 animate-pulse border border-[#1E293B]/50 flex items-center justify-between px-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#334155]/50" />
                      <div className="w-48 h-4 rounded bg-[#334155]/50" />
                    </div>
                    <div className="w-24 h-4 rounded bg-[#334155]/50" />
                  </div>
                ))}
              </div>
            ) : top10Hashtags.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Hash className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">No hashtags found for this territory right now.</p>
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500"
                >
                  Reload Feed
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {top10Hashtags.map((trend, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  const formattedTag = trend.name.startsWith('#') ? trend.name : `#${trend.name}`;
                  const isCopied = copiedIndex === idx;

                  // Rank Badge Colors
                  const rankBadgeClass =
                    rank === 1
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : rank === 2
                      ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                      : rank === 3
                      ? 'bg-amber-700/20 text-amber-400 border-amber-700/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700';

                  return (
                    <div
                      key={idx}
                      className={`group p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isTop3
                          ? 'bg-[#131E33] border-blue-500/20 hover:border-cyan-500/40 hover:bg-[#16233B]'
                          : 'bg-[#0B132B]/60 border-[#1E293B] hover:border-slate-700 hover:bg-[#0F172A]'
                      }`}
                    >
                      {/* Left: Rank & Hashtag */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Rank Badge */}
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg flex items-center justify-center font-mono font-bold text-xs sm:text-sm border ${rankBadgeClass}`}
                        >
                          #{rank}
                        </div>

                        {/* Tag Name & Volume */}
                        <div className="min-w-0">
                          <a
                            href={trend.searchUrl || `https://x.com/search?q=${encodeURIComponent(formattedTag)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm sm:text-base font-bold text-white hover:text-cyan-400 transition-colors truncate block flex items-center gap-1.5"
                          >
                            <span className="truncate">{formattedTag}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                          </a>

                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span>{formatTweetVolume(trend.tweetVolume)} posts</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {trend.status === 'EXPLODING' ? (
                                <span className="text-rose-400 font-medium flex items-center gap-0.5">
                                  <Flame className="w-3 h-3 inline text-rose-500" />
                                  Exploding
                                </span>
                              ) : trend.status === 'RISING' ? (
                                <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                                  <TrendingUp className="w-3 h-3 inline text-emerald-400" />
                                  Rising
                                </span>
                              ) : (
                                <span className="text-slate-400">Stable</span>
                              )}
                            </span>
                            {trend.velocityScore && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-cyan-400">Vel: {trend.velocityScore}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Copy & External Link Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopySingle(formattedTag, idx)}
                          title="Copy Hashtag"
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-[#1E293B] text-slate-300 hover:text-white hover:bg-[#334155] border-transparent'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="hidden sm:inline">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Copy</span>
                            </>
                          )}
                        </button>

                        <a
                          href={trend.searchUrl || `https://x.com/search?q=${encodeURIComponent(formattedTag)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on X"
                          className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-300 hover:text-cyan-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Call-To-Action to Advance Panel */}
          <div className="p-4 bg-[#070B14] border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Want deeper insights, charts, and 50 full trends for <strong>{selectedLocation.name}</strong>?
            </div>
            <button
              type="button"
              onClick={() => {
                clearActiveSession();
                router.push(selectedLocation.slug === 'worldwide' ? '/' : `/trends/${selectedLocation.slug}`);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Switch to Advance Panel (7492)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
