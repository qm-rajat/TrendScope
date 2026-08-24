'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  getTelemetrySummary,
  recordApiCall,
  clearApiLogs,
  TelemetrySummary,
} from '@/lib/telemetry';
import {
  Activity,
  Zap,
  Clock,
  Database,
  Send,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ApiUsageGraphProps {
  customApiKey?: string;
  className?: string;
}

export function ApiUsageGraph({ customApiKey, className = '' }: ApiUsageGraphProps) {
  const [summary, setSummary] = useState<TelemetrySummary | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return getTelemetrySummary();
      } catch {
        return null;
      }
    }
    return null;
  });
  const [chartView, setChartView] = useState<'volume' | 'latency' | 'locations'>('volume');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Load telemetry summary
  const refreshTelemetry = () => {
    const data = getTelemetrySummary();
    setSummary(data);
  };

  const handleTestApiPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const headers: Record<string, string> = {};
      if (customApiKey && customApiKey.trim().length > 0) {
        headers['x-custom-api-key'] = customApiKey.trim();
      }

      const res = await fetch('/api/trends?location=worldwide&limit=10&force=true', {
        headers,
      });
      const end = performance.now();
      const latency = Math.round(end - start);
      const json = await res.json();

      recordApiCall(
        '/api/trends?location=worldwide',
        'worldwide',
        res.status,
        latency,
        Boolean(json.cached),
        json.source || 'getxapi',
        Boolean(customApiKey)
      );

      refreshTelemetry();
      setTestResult(
        `Ping success! Status: ${res.status} (${json.source || 'getxapi'}), Latency: ${latency}ms`
      );
    } catch {
      setTestResult('Ping failed: network error');
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  const handleClearHistory = () => {
    clearApiLogs();
    refreshTelemetry();
  };

  if (!summary) {
    return (
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded-md mb-4" />
        <div className="h-56 bg-slate-900 rounded-xl" />
      </div>
    );
  }

  return (
    <div
      id="container-api-usage-analytics"
      className={`p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-xs space-y-6 ${className}`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>API Usage & Telemetry Analytics</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Live Metrics
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring of GetXAPI requests, cache hit efficiency, and response latency.
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center bg-[#070B14] p-1 rounded-xl border border-[#1E2D4A]">
            <button
              type="button"
              onClick={() => setChartView('volume')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartView === 'volume'
                  ? 'bg-[#1E2D4A] text-cyan-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Request Volume
            </button>
            <button
              type="button"
              onClick={() => setChartView('latency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartView === 'latency'
                  ? 'bg-[#1E2D4A] text-cyan-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Latency (ms)
            </button>
            <button
              type="button"
              onClick={() => setChartView('locations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartView === 'locations'
                  ? 'bg-[#1E2D4A] text-cyan-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Country
            </button>
          </div>

          <button
            type="button"
            onClick={handleTestApiPing}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Pinging...' : 'Test API Ping'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearHistory}
            title="Reset telemetry metrics"
            className="p-1.5 rounded-xl bg-[#070B14] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-[#1E2D4A] hover:border-rose-500/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ping Status Toast */}
      {testResult && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Key Metric Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Calls */}
        <div className="p-4 rounded-xl bg-[#070B14] border border-[#1E2D4A]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Requests</span>
            <Database className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{summary.totalRequests}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>{summary.todayRequests} today</span>
          </div>
        </div>

        {/* Cache Hit Ratio */}
        <div className="p-4 rounded-xl bg-[#070B14] border border-[#1E2D4A]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cache Efficiency</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {summary.cacheHitRatio}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary.cachedRequests} cached / {summary.liveRequests} live
          </div>
        </div>

        {/* Avg Latency */}
        <div className="p-4 rounded-xl bg-[#070B14] border border-[#1E2D4A]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Avg Response Latency</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 font-mono">{summary.avgLatencyMs}ms</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Success Rate: {summary.successRate}%
          </div>
        </div>

        {/* Quota Tracker */}
        <div className="p-4 rounded-xl bg-[#070B14] border border-[#1E2D4A]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Monthly Quota</span>
            <Server className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {summary.quotaUsed} / {summary.quotaLimit}
          </div>
          <div className="w-full bg-[#1E293B] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (summary.quotaUsed / summary.quotaLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="p-4 rounded-xl bg-[#070B14] border border-[#1E2D4A]">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {chartView === 'volume' && '24-Hour API Request Throughput (Live vs Cached)'}
              {chartView === 'latency' && '24-Hour Server Response Latency Trend (ms)'}
              {chartView === 'locations' && 'Top Query Distribution by Country Location'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            {chartView === 'volume' && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Live API
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Cached Hits
                </span>
              </>
            )}
            {chartView === 'latency' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Response Time (ms)
              </span>
            )}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'volume' ? (
              <AreaChart data={summary.hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCached" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-xl text-xs space-y-1">
                          <div className="font-semibold text-white font-mono">{label}</div>
                          <div className="text-cyan-400">
                            Live Provider Calls: {payload[0]?.value}
                          </div>
                          <div className="text-blue-400">
                            Cached Responses: {payload[1]?.value}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="live"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLive)"
                />
                <Area
                  type="monotone"
                  dataKey="cached"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCached)"
                />
              </AreaChart>
            ) : chartView === 'latency' ? (
              <LineChart data={summary.hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="ms" axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-xl text-xs space-y-1">
                          <div className="font-semibold text-white font-mono">{label}</div>
                          <div className="text-emerald-400 font-mono">
                            Avg Latency: {payload[0]?.value} ms
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#34D399' }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={summary.locationBreakdown}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  dataKey="label"
                  type="category"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">{data.label}</div>
                          <div className="text-cyan-400">
                            Total Calls: {data.calls} ({data.percentage}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="calls" fill="#06B6D4" radius={[0, 6, 6, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Request Stream Log */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Recent API Request Audit Trail
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Showing latest {summary.recentLogs.length} events
          </span>
        </div>

        <div className="divide-y divide-[#1E293B] rounded-xl border border-[#1E2D4A] bg-[#070B14] overflow-hidden">
          {summary.recentLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 flex items-center justify-between text-xs hover:bg-[#0F172A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                    log.statusCode === 200
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {log.statusCode}
                </span>

                <div>
                  <div className="font-mono text-slate-200 text-[11px]">{log.endpoint}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()} • {log.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    log.isCached
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}
                >
                  {log.isCached ? 'Cache HIT' : 'GetXAPI Live'}
                </span>

                <span className="font-mono text-[11px] text-slate-400 min-w-14 text-right">
                  {log.latencyMs} ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
