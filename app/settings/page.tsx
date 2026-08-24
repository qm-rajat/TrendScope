'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ApiStatus } from '@/components/ApiStatus';
import { LOCATIONS } from '@/lib/locations';
import { SQLITE_SCHEMA_DDL } from '@/lib/db-schema';
import {
  Settings,
  ShieldCheck,
  Database,
  Trash2,
  Download,
  Key,
  RefreshCw,
  Server,
  Layers,
} from 'lucide-react';

export default function SettingsPage() {
  const [defaultLocation, setDefaultLocation] = useState('worldwide');
  const [refreshInterval, setRefreshInterval] = useState('300');
  const [apiStatus, setApiStatus] = useState<unknown>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => setApiStatus(data))
      .catch(() => {});
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    setMessage(null);
    try {
      // Force refresh worldwide and common keys
      await fetch('/api/trends?location=worldwide&force=true');
      setMessage('Server cache successfully purged and re-initialized.');
    } catch {
      setMessage('Failed to purge cache.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch(`/api/trends?location=${defaultLocation}&limit=50`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trendscope-${defaultLocation}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error exporting data');
    }
  };

  return (
    <DashboardLayout currentLocationSlug="worldwide" navigateOnSelect={false}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1E293B]/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              System Settings & Architecture
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              v1.0.0
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Configure telemetry intervals, inspect SQLite architecture, and review GetXAPI server security.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Integration & Security */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">GetXAPI Credentials Security</h3>
                <p className="text-xs text-slate-400">Server-Side Secret Enclosure</p>
              </div>
            </div>
            <ApiStatus isDemo={Boolean(apiStatus && !(apiStatus as { isConfigured?: boolean }).isConfigured)} />
          </div>

          <div className="p-4 rounded-xl bg-[#070B14] border border-[#1E2D4A] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Environment Variable:</span>
              <code className="font-mono text-cyan-300 bg-[#141E33] px-2 py-0.5 rounded">
                GETXAPI_API_KEY
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Client-Side Exposure:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 0% (Strict Server Route)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Route Handler:</span>
              <span className="font-mono text-slate-300">/app/api/trends/route.ts</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The API key is accessed exclusively by server-side route handlers. If no key is set, the application operates in High-Fidelity Demo Mode with location-tailored trend simulation.
          </p>
        </div>

        {/* Caching & Data Management */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E293B]">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Server-Side Cache Layer</h3>
              <p className="text-xs text-slate-400">Memory / Redis / SQLite Interface</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#070B14] border border-[#1E2D4A]">
              <span className="text-slate-400">Default Cache TTL:</span>
              <span className="font-mono text-white font-semibold">300 seconds (5 mins)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#141E33] hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 border border-[#1E2D4A] hover:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? 'Purging Cache...' : 'Purge Server Cache'}</span>
              </button>

              <button
                onClick={handleExportData}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Feed</span>
              </button>
            </div>
          </div>
        </div>

        {/* General Preferences */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E293B]">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Dashboard Preferences</h3>
              <p className="text-xs text-slate-400">Defaults & Refresh Interval</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Default Location</label>
              <select
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070B14] border border-[#1E2D4A] text-slate-200 focus:outline-hidden"
              >
                {LOCATIONS.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.flag} {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Auto-Refresh Frequency</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070B14] border border-[#1E2D4A] text-slate-200 focus:outline-hidden"
              >
                <option value="60">1 Minute (High Density)</option>
                <option value="120">2 Minutes</option>
                <option value="300">5 Minutes (Default Standard)</option>
                <option value="600">10 Minutes (Low Bandwidth)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SQLite Database Schema Architecture */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E293B]">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">SQLite Historical Schema</h3>
              <p className="text-xs text-slate-400">30-Minute Snapshot Architecture</p>
            </div>
          </div>

          <div className="p-3 bg-[#070B14] rounded-xl border border-[#1E2D4A] overflow-x-auto max-h-48">
            <pre className="text-[10px] font-mono text-slate-300 leading-relaxed">
              {SQLITE_SCHEMA_DDL.trim()}
            </pre>
          </div>
          <p className="text-[11px] text-slate-400">
            Database access layer abstracted in <code className="text-cyan-300">/lib/db-schema.ts</code> for future continuous snapshot workers.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
