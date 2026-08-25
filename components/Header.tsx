'use client';

import React from 'react';
import { Menu, Zap } from 'lucide-react';
import { CountrySelector } from './CountrySelector';
import { RefreshControl } from './RefreshControl';
import { TrendScopeLogo } from './TrendScopeLogo';
import { LocationConfig } from '@/types/trends';

interface HeaderProps {
  currentLocationSlug: string;
  onSelectLocation?: (location: LocationConfig) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onToggleMobileMenu?: () => void;
  navigateOnSelect?: boolean;
}

export function Header({
  currentLocationSlug,
  onSelectLocation,
  onRefresh,
  isRefreshing = false,
  onToggleMobileMenu,
  navigateOnSelect = false,
}: HeaderProps) {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full bg-[#070B14]/90 backdrop-blur-md border-b border-[#1E293B] px-4 lg:px-8 py-3.5"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Section: Mobile Menu + Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onToggleMobileMenu && (
              <button
                id="btn-mobile-hamburger"
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 rounded-xl bg-[#0F172A] border border-[#1E293B] text-slate-300 hover:text-white"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="lg:hidden">
                <TrendScopeLogo size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span>TrendScope</span>
                    <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Zap className="w-3 h-3 inline mr-1 text-cyan-400" />
                      X Intelligence
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Monitor trending topics and hashtags across X by location.
                </p>
              </div>
            </div>
          </div>

          {/* Quick country selector on mobile */}
          <div className="md:hidden">
            <CountrySelector
              currentLocationSlug={currentLocationSlug}
              onSelectLocation={onSelectLocation}
              navigateOnSelect={navigateOnSelect}
            />
          </div>
        </div>

        {/* Right Section: Country Selector + Refresh Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <div className="hidden md:block">
            <CountrySelector
              currentLocationSlug={currentLocationSlug}
              onSelectLocation={onSelectLocation}
              navigateOnSelect={navigateOnSelect}
            />
          </div>

          <RefreshControl
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            defaultIntervalSeconds={300}
          />
        </div>
      </div>
    </header>
  );
}
