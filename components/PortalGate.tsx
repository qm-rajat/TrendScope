'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Unlock,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
  Hash,
} from 'lucide-react';
import {
  CODE_ADVANCE_PANEL,
  CODE_HASHTAG_SEARCH,
  setActiveSession,
  PortalSessionType,
} from '@/lib/auth-session';
import { TrendScopeLogo } from './TrendScopeLogo';

interface PortalGateProps {
  requiredPortal?: 'advance_7492' | 'hashtags_7491';
  onUnlocked?: (session: PortalSessionType) => void;
  title?: string;
  subtitle?: string;
}

export function PortalGate({
  requiredPortal,
  onUnlocked,
  title,
  subtitle,
}: PortalGateProps) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    digitInputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean && val !== '') return;

    const char = clean.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setCodeError(null);

    if (char && index < 3) {
      digitInputRefs.current[index + 1]?.focus();
    }

    if (index === 3 && char) {
      const fullCode = newDigits.join('');
      validateAndAuthorize(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        digitInputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const chars = pasted.split('');
      setDigits(chars);
      digitInputRefs.current[3]?.focus();
      validateAndAuthorize(pasted);
    }
  };

  const validateAndAuthorize = (code: string) => {
    if (code === CODE_ADVANCE_PANEL) {
      setCodeSuccess(true);
      setSuccessMsg('Access Granted: Advance Intelligence Panel (7492)');
      setActiveSession('advance_7492');
      if (onUnlocked) onUnlocked('advance_7492');
      setTimeout(() => {
        if (requiredPortal === 'hashtags_7491') {
          router.push('/');
        }
      }, 500);
      return;
    }

    if (code === CODE_HASHTAG_SEARCH) {
      setCodeSuccess(true);
      setSuccessMsg('Access Granted: Country Top 10 Hashtags (7491)');
      setActiveSession('hashtags_7491');
      if (onUnlocked) onUnlocked('hashtags_7491');
      setTimeout(() => {
        router.push('/hashtags');
      }, 500);
      return;
    }

    setCodeError('Invalid code. Please enter 7492 (Advance) or 7491 (Hashtags).');
  };

  const handleQuickUnlock = (code: string) => {
    const arr = code.split('');
    setDigits(arr);
    validateAndAuthorize(code);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />

        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400">
            <TrendScopeLogo size={48} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span>{title || 'TrendScope Access Portal'}</span>
              <Shield className="w-5 h-5 text-cyan-400 inline" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              {subtitle || 'This section is protected. Enter your 4-digit authorization code to access the isolated workspace.'}
            </p>
          </div>
        </div>

        {/* Dual Portal Description Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: Advance Panel */}
          <div
            onClick={() => handleQuickUnlock(CODE_ADVANCE_PANEL)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 group ${
              requiredPortal === 'advance_7492'
                ? 'bg-blue-600/15 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-[#070B14] border-[#1E2D4A] hover:border-cyan-500/40 hover:bg-[#0E1729]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <SlidersHorizontal className="w-4 h-4" />
              </span>
              <span className="font-mono text-xs font-bold text-cyan-300 bg-[#141E33] px-2 py-0.5 rounded border border-cyan-500/30">
                {CODE_ADVANCE_PANEL}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Advance Panel
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Full analytics, 50 trends, velocity radar, comparison & sync.
              </p>
            </div>
            <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1 pt-1">
              <span>Enter 7492</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Option 2: Top 10 Hashtags */}
          <div
            onClick={() => handleQuickUnlock(CODE_HASHTAG_SEARCH)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 group ${
              requiredPortal === 'hashtags_7491'
                ? 'bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/10'
                : 'bg-[#070B14] border-[#1E2D4A] hover:border-blue-500/40 hover:bg-[#0E1729]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Search className="w-4 h-4" />
              </span>
              <span className="font-mono text-xs font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/40">
                {CODE_HASHTAG_SEARCH}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Top 10 Hashtags
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Search country by name, instant suggestions & 1-click copy tags.
              </p>
            </div>
            <div className="text-[11px] text-blue-400 font-semibold flex items-center gap-1 pt-1">
              <span>Enter 7491</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 4-Box PIN Input Form */}
        <div className="space-y-4 pt-2">
          <label className="block text-xs font-medium text-slate-300 text-center">
            Enter 4-Digit Code to Unlock
          </label>

          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  digitInputRefs.current[idx] = el;
                }}
                id={`pin-gate-digit-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-2xl font-mono font-bold rounded-xl border-2 transition-all bg-[#070B14] text-white focus:outline-hidden ${
                  digit
                    ? 'border-cyan-500 shadow-md shadow-cyan-500/20'
                    : 'border-[#1E2D4A] focus:border-cyan-400'
                }`}
              />
            ))}
          </div>

          {/* Error / Success Feedback */}
          {codeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-center flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {codeError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center flex items-center justify-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{codeError}</span>
            </div>
          )}

          {/* Quick Action Unlock Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              id="btn-gate-unlock-7492"
              type="button"
              onClick={() => handleQuickUnlock(CODE_ADVANCE_PANEL)}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock 7492</span>
            </button>

            <button
              id="btn-gate-unlock-7491"
              type="button"
              onClick={() => handleQuickUnlock(CODE_HASHTAG_SEARCH)}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock 7491</span>
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 inline" />
          <span>Both workspaces operate independently with isolated sessions.</span>
        </div>
      </div>
    </div>
  );
}
