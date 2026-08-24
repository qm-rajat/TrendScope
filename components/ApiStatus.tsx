'use client';

import React, { useState } from 'react';
import { ShieldCheck, Info, X, Zap } from 'lucide-react';

interface ApiStatusProps {
  isDemo?: boolean;
  source?: string;
  error?: string;
  className?: string;
}

export function ApiStatus({ isDemo = true, error, className = '' }: ApiStatusProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {isDemo ? (
          <button
            id="btn-api-status-demo"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Click for API connection details"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>DEMO DATA</span>
            <Info className="w-3 h-3 text-amber-400 ml-0.5" />
          </button>
        ) : (
          <button
            id="btn-api-status-connected"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
            title="GetXAPI Live Connected"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>GetXAPI Live</span>
            <ShieldCheck className="w-3 h-3 text-emerald-400 ml-0.5" />
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div
            id="modal-api-status"
            className="w-full max-w-md bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl text-slate-200"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">GetXAPI Integration Status</h3>
                  <p className="text-xs text-slate-400">Server-side Data Pipeline</p>
                </div>
              </div>
              <button
                id="btn-close-api-status"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 space-y-4 text-sm">
              <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E2D4A] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Connection Mode:</span>
                  <span className={`font-semibold ${isDemo ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isDemo ? 'Synthetic Demo Mode' : 'Connected to GetXAPI'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Endpoint:</span>
                  <span className="font-mono text-slate-300">/api/trends (Server Route)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Key Security:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Server Secret
                  </span>
                </div>
              </div>

              {isDemo && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                  <p className="font-semibold text-amber-300 mb-1">To switch to Live GetXAPI trends:</p>
                  <p>
                    GetXAPI is running in demo mode. Add your <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">GETXAPI_API_KEY</code> into the server environment secrets to automatically stream live real-time trends from X.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {error}
                </div>
              )}
            </div>

            <button
              id="btn-dismiss-api-modal"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
