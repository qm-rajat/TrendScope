'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  RefreshCw,
  Play,
  Pause,
  Lock,
  Unlock,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  ShieldCheck,
  Settings,
  Key,
} from 'lucide-react';

export const MASTER_ACTIVATION_CODE = '7492';
const ACTIVATION_STORAGE_KEY = 'trendscope_autorefresh_activated';
const CUSTOM_KEY_STORAGE_KEY = 'trendscope_custom_api_key';

interface RefreshControlProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  defaultIntervalSeconds?: number;
  className?: string;
  lastUpdatedIso?: string;
}

export function RefreshControl({
  onRefresh,
  isRefreshing = false,
  defaultIntervalSeconds = 300, // 5 minutes default
  className = '',
}: RefreshControlProps) {
  // Auto-refresh is OFF by default when user first arrives
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [isActivated, setIsActivated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ACTIVATION_STORAGE_KEY);
        const customKey = localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
        // Activated if PIN verified or custom API key is present
        return stored === 'true' || stored === MASTER_ACTIVATION_CODE || Boolean(customKey && customKey.trim().length > 0);
      } catch {
        return false;
      }
    }
    return false;
  });
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
        return Boolean(key && key.trim().length > 0);
      } catch {
        return false;
      }
    }
    return false;
  });

  const [showActivationModal, setShowActivationModal] = useState<boolean>(false);
  
  // Supported intervals: 1 min (60s), 5 min (300s), 30 min (1800s)
  const INTERVAL_OPTIONS = [
    { label: '1m', seconds: 60, desc: '1 Minute' },
    { label: '5m', seconds: 300, desc: '5 Minutes' },
    { label: '30m', seconds: 1800, desc: '30 Minutes' },
  ];

  const [intervalSeconds, setIntervalSeconds] = useState<number>(defaultIntervalSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultIntervalSeconds);

  // 4-digit input state in modal
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input whenever modal opens
  useEffect(() => {
    if (showActivationModal) {
      const t = setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [showActivationModal]);

  // Sync state if custom key was updated
  useEffect(() => {
    const handleStorage = () => {
      try {
        const key = localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
        const isCustom = Boolean(key && key.trim().length > 0);
        setHasCustomKey(isCustom);
        if (isCustom) {
          setIsActivated(true);
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Stable reference to onRefresh to avoid timer disruptions
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // Countdown timer effect
  useEffect(() => {
    if (!autoRefresh || !isActivated) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Defer onRefresh execution out of the render loop
          setTimeout(() => {
            onRefreshRef.current();
          }, 0);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, intervalSeconds, isActivated]);

  // Format MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM.toString().padStart(2, '0')}m`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualClick = () => {
    setSecondsRemaining(intervalSeconds);
    onRefreshRef.current();
  };

  const handleIntervalChange = (secs: number) => {
    if (!isActivated) {
      setShowActivationModal(true);
      return;
    }
    setIntervalSeconds(secs);
    setSecondsRemaining(secs);
  };

  const handleToggleAutoRefresh = () => {
    if (!isActivated) {
      // Prompt user with the 4-digit activation modal or direct unlock
      setShowActivationModal(true);
      return;
    }
    const nextState = !autoRefresh;
    setAutoRefresh(nextState);
    if (nextState) {
      setSecondsRemaining(intervalSeconds);
    }
  };

  // Robust 4-digit PIN input handling
  const handleDigitChange = (index: number, val: string) => {
    const cleanNum = val.replace(/\D/g, '');
    if (!cleanNum) {
      const updated = [...digits];
      updated[index] = '';
      setDigits(updated);
      return;
    }

    const lastChar = cleanNum.slice(-1);
    const updated = [...digits];
    updated[index] = lastChar;
    setDigits(updated);
    setCodeError(null);

    // Auto-advance focus to next box
    if (index < 3) {
      digitInputRefs.current[index + 1]?.focus();
    }

    // Auto-validate if all filled
    const fullCode = updated.join('');
    if (fullCode.length === 4 && !updated.includes('')) {
      validateCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        const updated = [...digits];
        updated[index - 1] = '';
        setDigits(updated);
        digitInputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...digits];
        updated[index] = '';
        setDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted) {
      const newDigits = ['', '', '', ''];
      for (let i = 0; i < 4; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      if (pasted.length === 4) {
        validateCode(pasted);
      } else {
        digitInputRefs.current[Math.min(pasted.length, 3)]?.focus();
      }
    }
  };

  const validateCode = (inputCode: string) => {
    // Accept master code 7492, 2026, or any 4 digit code for seamless UX
    if (inputCode === MASTER_ACTIVATION_CODE || inputCode === '2026' || inputCode.length === 4) {
      setCodeSuccess(true);
      setCodeError(null);
      try {
        localStorage.setItem(ACTIVATION_STORAGE_KEY, 'true');
      } catch {}
      setTimeout(() => {
        setIsActivated(true);
        setAutoRefresh(true);
        setSecondsRemaining(intervalSeconds);
        setShowActivationModal(false);
        setCodeSuccess(false);
      }, 700);
    } else {
      setCodeError('Please enter a 4-digit code. Use master code: ' + MASTER_ACTIVATION_CODE);
    }
  };

  const handleQuickActivate = () => {
    const masterDigits = MASTER_ACTIVATION_CODE.split('');
    setDigits(masterDigits);
    validateCode(MASTER_ACTIVATION_CODE);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(MASTER_ACTIVATION_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      <div className={`flex items-center flex-wrap gap-2 ${className}`}>
        {/* Live Badge & Countdown */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {autoRefresh && isActivated ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
              )}
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {autoRefresh && isActivated
                ? hasCustomKey
                  ? 'Custom API Key Live'
                  : 'Live Sync Active'
                : 'Static (Last Refreshed)'}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <span className="text-xs font-mono text-cyan-400">
            {autoRefresh && isActivated ? formatTime(secondsRemaining) : 'Paused'}
          </span>
        </div>

        {/* Auto-Refresh Toggle Button */}
        <button
          id="btn-toggle-auto-refresh"
          type="button"
          onClick={handleToggleAutoRefresh}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            autoRefresh && isActivated
              ? 'bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20'
              : !isActivated
              ? 'bg-[#0F172A] text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
              : 'bg-[#0F172A] text-slate-400 border-[#1E293B] hover:text-slate-200'
          }`}
          title={
            !isActivated
              ? 'Enter 4-digit code or add your API Key to enable Auto Refresh'
              : autoRefresh
              ? 'Pause Auto Refresh'
              : 'Resume Auto Refresh'
          }
        >
          {!isActivated ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock Auto</span>
            </>
          ) : autoRefresh ? (
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
          title="Refresh trends data now"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>Refresh</span>
        </button>

        {/* Interval Selector: 1m (60s), 5m (300s), 30m (1800s) */}
        <div className="hidden md:flex items-center gap-1 bg-[#0F172A] p-0.5 rounded-xl border border-[#1E293B]">
          {INTERVAL_OPTIONS.map((opt) => (
            <button
              key={opt.seconds}
              id={`btn-interval-${opt.seconds}`}
              type="button"
              onClick={() => handleIntervalChange(opt.seconds)}
              title={`${opt.desc} auto-refresh`}
              className={`px-2 py-1 text-[11px] rounded-lg transition-colors cursor-pointer ${
                intervalSeconds === opt.seconds && isActivated
                  ? 'bg-[#1E293B] text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Digit Activation Code Modal with Custom API Key Option (Portaled to document.body) */}
      {isMounted && showActivationModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen w-screen bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            id="activation-code-modal"
            className="w-full max-w-md my-auto bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-6 relative overflow-hidden space-y-4"
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />

            {/* Close Button */}
            <button
              id="btn-close-activation-modal"
              type="button"
              onClick={() => {
                setShowActivationModal(false);
                setCodeError(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Activate Auto-Refresh</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    VIP Pass
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Enable high-frequency background polling (1m, 5m, 30m).
                </p>
              </div>
            </div>

            {/* Code Disclosure Banner */}
            <div className="p-3.5 rounded-xl bg-[#070B14] border border-[#1E2D4A]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Complimentary 4-Digit Code
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Use code below or click Auto-Fill
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-cyan-300 tracking-widest bg-[#141E33] px-2.5 py-1 rounded-lg border border-cyan-500/30">
                    {MASTER_ACTIVATION_CODE}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="Copy code"
                    className="p-1.5 rounded-lg bg-[#141E33] text-slate-300 hover:text-white border border-[#1E2D4A] transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 4-Box PIN Input Form */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300 text-center">
                Enter 4-digit code to unlock
              </label>

              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`input-pin-digit-${idx}`}
                    ref={(el) => {
                      digitInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-12 h-14 text-center font-mono text-xl font-bold rounded-xl bg-[#070B14] border text-white transition-all focus:outline-hidden ${
                      codeSuccess
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                        : codeError
                        ? 'border-rose-500 text-rose-300'
                        : 'border-[#1E2D4A] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                    }`}
                  />
                ))}
              </div>

              {/* Status feedback */}
              {codeSuccess && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activation Successful! Unlocking...</span>
                </div>
              )}

              {codeError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{codeError}</span>
                </div>
              )}

              {/* Quick Fill & Action Buttons */}
              <div className="pt-1 space-y-2">
                <button
                  id="btn-quick-fill-activate"
                  type="button"
                  onClick={handleQuickActivate}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-cyan-500/20"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Auto-Fill & Activate ({MASTER_ACTIVATION_CODE})</span>
                </button>
              </div>
            </div>

            {/* Custom API Key Alternative Section */}
            <div className="pt-3 border-t border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Prefer using your own API Key?
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                You can configure your own GetXAPI key in Settings. It automatically unlocks auto-refresh and unlocks live API usage graphs.
              </p>
              <Link
                href="/settings"
                onClick={() => setShowActivationModal(false)}
                className="w-full py-2 px-3 rounded-xl bg-[#141E33] hover:bg-[#1E2D4A] border border-[#1E2D4A] text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure Custom API Key in Settings →</span>
              </Link>
            </div>

            {/* Bottom Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Stored locally in session
              </span>
              <span>Intervals: 1m, 5m, 30m</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
