'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ApiStatus } from '@/components/ApiStatus';
import { ApiUsageGraph } from '@/components/ApiUsageGraph';
import { LOCATIONS } from '@/lib/locations';
import { SQLITE_SCHEMA_DDL } from '@/lib/db-schema';
import { MASTER_ACTIVATION_CODE } from '@/components/RefreshControl';
import {
  Settings,
  ShieldCheck,
  Database,
  Trash2,
  Download,
  Key,
  Server,
  Layers,
  KeyRound,
  Check,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const CUSTOM_KEY_STORAGE_KEY = 'trendscope_custom_api_key';

export default function SettingsPage() {
  const [defaultLocation, setDefaultLocation] = useState('worldwide');
  const [refreshInterval, setRefreshInterval] = useState('300');
  const [apiStatus, setApiStatus] = useState<unknown>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Custom API Key state
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(CUSTOM_KEY_STORAGE_KEY) || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [showKey, setShowKey] = useState<boolean>(false);
  const [keySaveStatus, setKeySaveStatus] = useState<string | null>(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);

  // VIP PIN Activation State
  const [isActivated, setIsActivated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const active = localStorage.getItem('trendscope_autorefresh_activated');
        const customKeyStored = localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
        return active === 'true' || Boolean(customKeyStored && customKeyStored.trim().length > 0);
      } catch {
        return false;
      }
    }
    return false;
  });
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchStatus = useCallback((keyToTest?: string) => {
    const headers: Record<string, string> = {};
    const key = keyToTest !== undefined ? keyToTest : customApiKey;
    if (key && key.trim().length > 0) {
      headers['x-custom-api-key'] = key.trim();
    }

    fetch('/api/status', { headers })
      .then((r) => r.json())
      .then((data) => setApiStatus(data))
      .catch(() => {});
  }, [customApiKey]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSaveCustomKey = async () => {
    setIsVerifyingKey(true);
    setKeySaveStatus(null);
    try {
      const trimmed = customApiKey.trim();
      if (trimmed.length > 0) {
        localStorage.setItem(CUSTOM_KEY_STORAGE_KEY, trimmed);
        localStorage.setItem('trendscope_autorefresh_activated', 'true');
        setIsActivated(true);

        // Verify key with /api/status
        const res = await fetch('/api/status', {
          headers: { 'x-custom-api-key': trimmed },
        });
        const statusData = await res.json();
        setApiStatus(statusData);

        setKeySaveStatus('Custom API key saved! Auto-refresh unlocked.');
      } else {
        localStorage.removeItem(CUSTOM_KEY_STORAGE_KEY);
        setKeySaveStatus('Custom API key removed. Using default demo mode.');
        fetchStatus('');
      }
    } catch {
      setKeySaveStatus('Saved locally to session.');
    } finally {
      setIsVerifyingKey(false);
      setTimeout(() => setKeySaveStatus(null), 4000);
    }
  };

  const handleClearCustomKey = () => {
    try {
      localStorage.removeItem(CUSTOM_KEY_STORAGE_KEY);
      setCustomApiKey('');
      setKeySaveStatus('Custom API key removed.');
      fetchStatus('');
    } catch {}
    setTimeout(() => setKeySaveStatus(null), 3000);
  };

  const handleToggleActivation = () => {
    try {
      if (isActivated) {
        localStorage.removeItem('trendscope_autorefresh_activated');
        setIsActivated(false);
        setMessage('Auto-refresh activation revoked for this session.');
      } else {
        localStorage.setItem('trendscope_autorefresh_activated', 'true');
        setIsActivated(true);
        setMessage('Auto-refresh successfully unlocked with 4-digit code.');
      }
    } catch {}
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(MASTER_ACTIVATION_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    setMessage(null);
    try {
      await fetch('/api/trends?location=worldwide&force=true');
      setMessage('Server cache successfully purged and re-initialized.');
    } catch {
      setMessage('Failed to purge cache.');
    } finally {
      setIsClearing(false);
      setTimeout(() => setMessage(null), 3000);
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
      // Ignored
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
              System Settings & API Telemetry
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              v1.0.0
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Configure custom API keys, inspect live telemetry graphs, adjust refresh intervals, and manage system caches.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium animate-in fade-in">
          {message}
        </div>
      )}

      {/* Main API Telemetry Graph Section */}
      <ApiUsageGraph customApiKey={customApiKey} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom GetXAPI Key Configuration */}
        <div id="custom-api-key" className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Custom GetXAPI Key</h3>
                <p className="text-xs text-slate-400">Bypass PIN & Enable Unlimited Refresh</p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5 ${
                customApiKey
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {customApiKey ? 'Custom Key Active' : 'Default Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Enter your personal GetXAPI key below. Storing your own API key automatically unlocks Auto-Refresh without requiring the 4-digit activation PIN.
          </p>

          <div className="space-y-3">
            <div className="relative">
              <input
                id="input-custom-api-key"
                type={showKey ? 'text' : 'password'}
                placeholder="getx_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#070B14] border border-[#1E2D4A] text-slate-200 text-xs font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {keySaveStatus && (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{keySaveStatus}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                id="btn-save-custom-key"
                type="button"
                onClick={handleSaveCustomKey}
                disabled={isVerifyingKey}
                className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shadow-cyan-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isVerifyingKey ? 'Verifying...' : 'Save & Verify Key'}</span>
              </button>

              {customApiKey && (
                <button
                  type="button"
                  onClick={handleClearCustomKey}
                  className="py-2.5 px-3 rounded-xl bg-[#141E33] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-[#1E2D4A] hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Auto-Refresh VIP Pass & 4-Digit Activation Code */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">4-Digit PIN Access Pass</h3>
                <p className="text-xs text-slate-400">Complimentary Auto-Refresh Code</p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5 ${
                isActivated
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {isActivated ? (
                <>
                  <Unlock className="w-3 h-3" /> Unlocked
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" /> Locked
                </>
              )}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070B14] border border-[#1E2D4A] flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Master Activation PIN:</span>
              </div>
              <div className="text-base font-mono font-bold text-cyan-300 tracking-widest mt-0.5">
                {MASTER_ACTIVATION_CODE}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              type="button"
              className="p-2 rounded-xl bg-[#141E33] hover:bg-[#1E2D4A] text-slate-300 hover:text-white border border-[#1E2D4A] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy PIN</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleToggleActivation}
            type="button"
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border ${
              isActivated
                ? 'bg-[#141E33] text-slate-300 hover:text-rose-300 border-[#1E2D4A] hover:border-rose-500/30 hover:bg-rose-500/10'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border-transparent shadow-xs'
            }`}
          >
            {isActivated ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Revoke / Relock Auto-Refresh</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Quick Unlock Auto-Refresh</span>
              </>
            )}
          </button>
        </div>

        {/* API Integration & Security Status */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Server-Side Proxy Security</h3>
                <p className="text-xs text-slate-400">Encapsulated API Communication</p>
              </div>
            </div>
            <ApiStatus isDemo={Boolean(apiStatus && !(apiStatus as { isConfigured?: boolean }).isConfigured)} />
          </div>

          <div className="p-4 rounded-xl bg-[#070B14] border border-[#1E2D4A] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Environment Secret:</span>
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
              <span className="text-slate-400">Active Provider:</span>
              <span className="font-mono text-slate-300">
                {apiStatus ? (apiStatus as { provider?: string }).provider : 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* Caching & Data Management */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E293B]">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Server Cache Layer</h3>
              <p className="text-xs text-slate-400">Memory & SQLite Interface</p>
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

        {/* General Dashboard Preferences */}
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
                <option value="300">5 Minutes (Default Standard)</option>
                <option value="1800">30 Minutes (Low Bandwidth)</option>
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
            Database access layer abstracted in <code className="text-cyan-300">/lib/db-schema.ts</code> for historical trend logging.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
