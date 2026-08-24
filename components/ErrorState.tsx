'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  type?: 'general' | 'rateLimit' | 'network' | 'auth';
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  isRetrying = false,
  type = 'general',
  className = '',
}: ErrorStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'rateLimit':
        return <ShieldAlert className="w-10 h-10 text-amber-400" />;
      case 'network':
        return <WifiOff className="w-10 h-10 text-rose-400" />;
      default:
        return <AlertTriangle className="w-10 h-10 text-amber-400" />;
    }
  };

  const defaultTitle =
    type === 'rateLimit'
      ? 'Rate Limit Reached'
      : type === 'network'
      ? 'Network Connection Issue'
      : 'Unable to Load Trends';

  const defaultMessage =
    type === 'rateLimit'
      ? 'Trend provider rate limit reached. Please wait a moment before trying again.'
      : type === 'network'
      ? 'Could not connect to the trends service. Please check your network.'
      : 'We encountered an error while fetching the latest X trends.';

  return (
    <div
      id="container-error-state"
      className={`p-8 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center max-w-lg mx-auto my-6 space-y-4 shadow-xl ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#141E33] border border-[#1E2D4A] flex items-center justify-center mx-auto">
        {getIcon()}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white">{title || defaultTitle}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {message || defaultMessage}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            id="btn-retry-trends"
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Retry Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
