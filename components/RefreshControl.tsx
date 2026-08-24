'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, Pause } from 'lucide-react';

interface RefreshControlProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  defaultIntervalSeconds?: number;
  className?: string;
}

export function RefreshControl({
  onRefresh,
  isRefreshing = false,
  defaultIntervalSeconds = 300, // 5 minutes
  className = '',
}: RefreshControlProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalSeconds, setIntervalSeconds] = useState(defaultIntervalSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(defaultIntervalSeconds);

  // Keep a stable reference to onRefresh to avoid timer disruptions
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // Countdown timer effect
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Defer onRefresh invocation to next task tick to prevent render-phase state collision
          setTimeout(() => {
            onRefreshRef.current();
          }, 0);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, intervalSeconds]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualClick = () => {
    setSecondsRemaining(intervalSeconds);
    onRefreshRef.current();
  };

  const handleIntervalChange = (secs: number) => {
    setIntervalSeconds(secs);
    setSecondsRemaining(secs);
  };

  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      {/* Live Badge & Countdown */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {autoRefresh ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
            )}
          </span>
          <span className="text-xs font-semibold text-slate-200">
            {autoRefresh ? 'Live' : 'Paused'}
          </span>
        </div>

        <span className="text-slate-600">|</span>

        <span className="text-xs font-mono text-cyan-400">
          {autoRefresh ? formatTime(secondsRemaining) : '--:--'}
        </span>
      </div>

      {/* Auto-Refresh Toggle Button */}
      <button
        id="btn-toggle-auto-refresh"
        type="button"
        onClick={() => setAutoRefresh(!autoRefresh)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
          autoRefresh
            ? 'bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20'
            : 'bg-[#0F172A] text-slate-400 border-[#1E293B] hover:text-slate-200'
        }`}
        title={autoRefresh ? 'Pause Auto Refresh' : 'Resume Auto Refresh'}
      >
        {autoRefresh ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto ON</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto OFF</span>
          </>
        )}
      </button>

      {/* Manual Refresh Button */}
      <button
        id="btn-manual-refresh"
        type="button"
        onClick={handleManualClick}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
        title="Refresh data now"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
        />
        <span>Refresh</span>
      </button>

      {/* Interval Selector */}
      <div className="hidden md:flex items-center gap-1">
        {[60, 300, 600].map((secs) => (
          <button
            key={secs}
            id={`btn-interval-${secs}`}
            type="button"
            onClick={() => handleIntervalChange(secs)}
            className={`px-2 py-1 text-[11px] rounded-lg transition-colors cursor-pointer ${
              intervalSeconds === secs
                ? 'bg-[#1E293B] text-cyan-400 font-medium'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {secs / 60}m
          </button>
        ))}
      </div>
    </div>
  );
}
