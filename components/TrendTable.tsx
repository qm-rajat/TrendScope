'use client';

import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, Flame, TrendingUp, TrendingDown, ArrowDownRight, Minus, Sparkles, Hash, MessageSquare, Quote, ArrowUpDown, Layers, SlidersHorizontal } from 'lucide-react';
import { TrendItem, TrendStatus, TrendType } from '@/types/trends';
import { formatTweetVolume, getStatusTheme, getTrendTypeTheme } from '@/lib/trend-utils';
import { TrendCard } from './TrendCard';

interface TrendTableProps {
  trends: TrendItem[];
  locationName?: string;
  className?: string;
}

export function TrendTable({ trends, locationName = 'Worldwide', className = '' }: TrendTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TrendType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TrendStatus>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'volume' | 'velocity'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Count items by type for badge counts
  const counts = useMemo(() => {
    let hashtags = 0;
    let topics = 0;
    let phrases = 0;
    for (const t of trends) {
      if (t.type === 'hashtag') hashtags++;
      else if (t.type === 'phrase') phrases++;
      else topics++;
    }
    return {
      all: trends.length,
      hashtag: hashtags,
      topic: topics,
      phrase: phrases,
    };
  }, [trends]);

  // Filter & sort trends
  const filteredTrends = useMemo(() => {
    return trends
      .filter((trend) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = trend.name.toLowerCase().includes(query);
          const matchesCategory = trend.category?.toLowerCase().includes(query);
          if (!matchesName && !matchesCategory) return false;
        }

        // Type filter
        if (typeFilter !== 'all') {
          const actualType = trend.type || 'topic';
          if (actualType !== typeFilter) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all' && trend.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rank') {
          return sortOrder === 'asc' ? a.rank - b.rank : b.rank - a.rank;
        }
        if (sortBy === 'volume') {
          const volA = a.tweetVolume || 0;
          const volB = b.tweetVolume || 0;
          return sortOrder === 'asc' ? volA - volB : volB - volA;
        }
        if (sortBy === 'velocity') {
          const changeA = a.change || 0;
          const changeB = b.change || 0;
          return sortOrder === 'asc' ? changeA - changeB : changeB - changeA;
        }
        return 0;
      });
  }, [trends, searchQuery, typeFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'rank' | 'volume' | 'velocity') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const renderStatusPill = (status?: TrendStatus) => {
    const theme = getStatusTheme(status || 'STABLE');
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${theme.bg} ${theme.text} ${theme.border}`}
      >
        {status === 'EXPLODING' && <Flame className="w-3 h-3 text-rose-400" />}
        {status === 'RISING' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
        {status === 'COOLING' && <TrendingDown className="w-3 h-3 text-purple-400" />}
        {status === 'FALLING' && <ArrowDownRight className="w-3 h-3 text-amber-400" />}
        {(!status || status === 'STABLE') && <Minus className="w-3 h-3 text-cyan-400" />}
        <span>{theme.label}</span>
      </span>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Control Bar: Search & Type Filter Tabs */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-xs">
        {/* Search Field */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="input-trend-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${trends.length} trends in ${locationName}...`}
            className="w-full pl-9 pr-14 py-2 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs font-medium px-2 py-0.5 rounded bg-[#1E293B] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Type Toggle Tabs & Velocity Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Type Filter Tabs */}
          <div
            id="group-type-filters"
            className="flex items-center p-1 rounded-xl bg-[#070B14] border border-[#1E2D4A] gap-1 overflow-x-auto"
          >
            {/* All */}
            <button
              id="filter-type-all"
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#141E33]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  typeFilter === 'all' ? 'bg-blue-700/80 text-white' : 'bg-[#1E293B] text-slate-400'
                }`}
              >
                {counts.all}
              </span>
            </button>

            {/* Hashtags */}
            <button
              id="filter-type-hashtag"
              type="button"
              onClick={() => setTypeFilter('hashtag')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                typeFilter === 'hashtag'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-blue-400 hover:bg-[#141E33]'
              }`}
            >
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              <span>Hashtags</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  typeFilter === 'hashtag'
                    ? 'bg-blue-700/80 text-white'
                    : 'bg-blue-500/10 text-blue-400'
                }`}
              >
                {counts.hashtag}
              </span>
            </button>

            {/* Topics */}
            <button
              id="filter-type-topic"
              type="button"
              onClick={() => setTypeFilter('topic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                typeFilter === 'topic'
                  ? 'bg-purple-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-purple-400 hover:bg-[#141E33]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>Topics</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  typeFilter === 'topic'
                    ? 'bg-purple-700/80 text-white'
                    : 'bg-purple-500/10 text-purple-400'
                }`}
              >
                {counts.topic}
              </span>
            </button>

            {/* Phrases */}
            <button
              id="filter-type-phrase"
              type="button"
              onClick={() => setTypeFilter('phrase')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                typeFilter === 'phrase'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-[#141E33]'
              }`}
            >
              <Quote className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phrases</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  typeFilter === 'phrase'
                    ? 'bg-emerald-700/80 text-white'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {counts.phrase}
              </span>
            </button>
          </div>

          {/* Velocity Status Filter */}
          <div className="flex items-center gap-1.5">
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | TrendStatus)}
              className="px-3 py-2 rounded-xl bg-[#070B14] border border-[#1E2D4A] text-xs text-slate-300 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">⚡ All Velocity</option>
              <option value="EXPLODING">🔥 Exploding</option>
              <option value="RISING">📈 Rising</option>
              <option value="STABLE">➖ Stable</option>
              <option value="FALLING">📉 Falling</option>
              <option value="COOLING">❄️ Cooling</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Active Filter Indicator Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-white font-mono">{filteredTrends.length}</strong> of{' '}
            <span className="font-mono">{trends.length}</span> trends
          </span>
          {typeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#141E33] border border-[#1E2D4A] text-[11px] text-cyan-300">
              Type: <strong className="capitalize">{typeFilter}s</strong>
              <button
                onClick={() => setTypeFilter('all')}
                className="ml-1 hover:text-white text-slate-400"
                title="Reset type filter"
              >
                ×
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#141E33] border border-[#1E2D4A] text-[11px] text-amber-300">
              Velocity: <strong className="capitalize">{statusFilter.toLowerCase()}</strong>
              <button
                onClick={() => setStatusFilter('all')}
                className="ml-1 hover:text-white text-slate-400"
                title="Reset velocity filter"
              >
                ×
              </button>
            </span>
          )}
        </div>

        {searchQuery && (
          <span className="text-cyan-400 font-medium">Filtered by &quot;{searchQuery}&quot;</span>
        )}
      </div>

      {/* Desktop / Tablet Table View (hidden on small screens) */}
      <div className="hidden md:block overflow-hidden rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-sm">
        <div className="overflow-x-auto">
          <table id="table-trends-main" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0A0F1D] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th
                  onClick={() => toggleSort('rank')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Trend & Topic</th>
                <th className="py-3.5 px-4">Type</th>
                <th
                  onClick={() => toggleSort('volume')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('velocity')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">First Seen</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-sm">
              {filteredTrends.length > 0 ? (
                filteredTrends.map((trend) => {
                  const typeTheme = getTrendTypeTheme(trend.type || 'topic');
                  return (
                    <tr
                      key={`${trend.rank}-${trend.name}`}
                      id={`row-trend-${trend.rank}`}
                      className="hover:bg-[#141F38]/50 transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                            trend.rank === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : trend.rank === 2
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30'
                              : trend.rank === 3
                              ? 'bg-amber-700/20 text-amber-400 border border-amber-700/30'
                              : 'bg-[#141E33] text-slate-400'
                          }`}
                        >
                          #{trend.rank}
                        </span>
                      </td>

                      {/* Trend Name (Clickable to X in new tab) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <a
                            id={`link-trend-table-${trend.rank}`}
                            href={trend.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-slate-100 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
                          >
                            <span>{trend.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                          </a>
                          {trend.promoted && (
                            <span className="text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Sparkles className="w-2.5 h-2.5" /> Promoted
                            </span>
                          )}
                        </div>
                        {trend.category && (
                          <span className="text-[10px] text-slate-500 block">
                            {trend.category}
                          </span>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${typeTheme.bg} ${typeTheme.text} ${typeTheme.border}`}
                        >
                          {typeTheme.label}
                        </span>
                      </td>

                      {/* Tweet Volume */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                        {formatTweetVolume(trend.tweetVolume)}
                      </td>

                      {/* Rank Change */}
                      <td className="py-3.5 px-4 font-mono font-medium">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            trend.change && trend.change > 0
                              ? 'text-emerald-400'
                              : trend.change && trend.change < 0
                              ? 'text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {trend.change && trend.change > 0
                            ? `↑ ${trend.change}`
                            : trend.change && trend.change < 0
                            ? `↓ ${Math.abs(trend.change)}`
                            : '• 0'}
                        </span>
                      </td>

                      {/* First Seen */}
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {trend.firstSeen || 'Recently'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-right">
                        {renderStatusPill(trend.status)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    No trends found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Stacked Card View (hidden on desktop) */}
      <div className="block md:hidden space-y-3">
        {filteredTrends.length > 0 ? (
          filteredTrends.map((trend) => (
            <TrendCard key={`${trend.rank}-${trend.name}`} trend={trend} />
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center text-slate-500 text-sm">
            No trends found matching your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
