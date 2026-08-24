'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { TrendItem, HistoricalSnapshot } from '@/types/trends';
import { formatTweetVolume } from '@/lib/trend-utils';
import { BarChart3, LineChart as LineChartIcon, Activity } from 'lucide-react';

interface TrendChartProps {
  trends?: TrendItem[];
  historyData?: HistoricalSnapshot[];
  trendName?: string;
  className?: string;
}

export function TrendChart({
  trends = [],
  historyData = [],
  trendName,
  className = '',
}: TrendChartProps) {
  const [chartMode, setChartMode] = useState<'volume' | 'rankTrajectory'>('volume');

  // Top 10 trends for volume visualization
  const volumeData = trends
    .filter((t) => (t.tweetVolume || 0) > 0)
    .slice(0, 8)
    .map((t) => ({
      name: t.name.length > 14 ? `${t.name.slice(0, 13)}…` : t.name,
      fullName: t.name,
      volume: t.tweetVolume || 0,
      rank: t.rank,
      type: t.type,
    }));

  return (
    <div
      id="container-trend-chart"
      className={`p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              {chartMode === 'volume' ? 'Top Tweet Volumes' : `Rank Movement: ${trendName || 'Selected Topic'}`}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {chartMode === 'volume'
              ? 'Real-time tweet volume breakdown by top trending queries'
              : 'Historical position tracking (Rank #1 is top position)'}
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center gap-1 p-1 bg-[#070B14] rounded-xl border border-[#1E2D4A]">
          <button
            id="btn-chart-mode-volume"
            type="button"
            onClick={() => setChartMode('volume')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              chartMode === 'volume'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Volume</span>
          </button>
          <button
            id="btn-chart-mode-rank"
            type="button"
            onClick={() => setChartMode('rankTrajectory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              chartMode === 'rankTrajectory'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Rank Trajectory</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {chartMode === 'volume' ? (
          volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  stroke="#334155"
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(val) => formatTweetVolume(val)}
                  stroke="#334155"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-[#0B1120] border border-[#1E2D4A] rounded-xl shadow-xl text-xs">
                          <div className="font-semibold text-white mb-1">
                            {data.fullName}
                          </div>
                          <div className="text-cyan-400 font-mono">
                            Volume: {formatTweetVolume(data.volume)}
                          </div>
                          <div className="text-slate-400 mt-1">
                            Current Rank: #{data.rank}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="volume"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No volume metrics available for current filters
            </div>
          )
        ) : (
          /* Rank Trajectory Chart (Inverted Y-axis so rank 1 is highest) */
          historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historyData}
                margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="timeLabel"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  stroke="#334155"
                />
                <YAxis
                  reversed={true} // Invert so Rank #1 is at top
                  domain={[1, 50]}
                  ticks={[1, 10, 20, 30, 40, 50]}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(val) => `#${val}`}
                  stroke="#334155"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-[#0B1120] border border-[#1E2D4A] rounded-xl shadow-xl text-xs">
                          <div className="font-semibold text-white mb-1">
                            {data.timeLabel}
                          </div>
                          <div className="text-emerald-400 font-mono font-bold">
                            Rank: #{data.rank}
                          </div>
                          {data.tweetVolume && (
                            <div className="text-slate-400 mt-0.5">
                              Volume: {formatTweetVolume(data.tweetVolume)}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#38BDF8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select a trend to view historical movement
            </div>
          )
        )}
      </div>
    </div>
  );
}
